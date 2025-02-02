/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { ServerTelemetryManager, AADServerParamKeys, PerformanceEvents, TimeUtils, ScopeSet, createClientAuthError, ClientAuthErrorCodes, AuthToken, buildAccountToCache, AccountEntity, Constants, AuthorityType, AuthenticationScheme, PopTokenGenerator, updateAccountTenantProfileData, CacheHelpers, createAuthError, AuthErrorCodes, UrlString, OIDC_DEFAULT_SCOPES, invokeAsync, PromptValue } from '@azure/msal-common/browser';
import { BaseInteractionClient } from './BaseInteractionClient.mjs';
import { NativeConstants, BrowserConstants, NativeExtensionMethod, TemporaryCacheKeys, ApiId } from '../utils/BrowserConstants.mjs';
import { NativeAuthError, isFatalNativeAuthError, createNativeAuthError } from '../error/NativeAuthError.mjs';
import { createBrowserAuthError } from '../error/BrowserAuthError.mjs';
import { SilentCacheClient } from './SilentCacheClient.mjs';
import { base64Decode } from '../encode/Base64Decode.mjs';
import { version } from '../packageMetadata.mjs';
import { invalidPopTokenRequest, nativePromptNotSupported } from '../error/BrowserAuthErrorCodes.mjs';
import { userSwitch } from '../error/NativeAuthErrorCodes.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class NativeInteractionClient extends BaseInteractionClient {
    constructor(config, browserStorage, browserCrypto, logger, eventHandler, navigationClient, apiId, performanceClient, provider, accountId, nativeStorageImpl, correlationId) {
        super(config, browserStorage, browserCrypto, logger, eventHandler, navigationClient, performanceClient, provider, correlationId);
        this.apiId = apiId;
        this.accountId = accountId;
        this.nativeMessageHandler = provider;
        this.nativeStorageManager = nativeStorageImpl;
        this.silentCacheClient = new SilentCacheClient(config, this.nativeStorageManager, browserCrypto, logger, eventHandler, navigationClient, performanceClient, provider, correlationId);
        this.serverTelemetryManager = this.initializeServerTelemetryManager(this.apiId);
        const extensionName = this.nativeMessageHandler.getExtensionId() ===
            NativeConstants.PREFERRED_EXTENSION_ID
            ? "chrome"
            : this.nativeMessageHandler.getExtensionId()?.length
                ? "unknown"
                : undefined;
        this.skus = ServerTelemetryManager.makeExtraSkuString({
            libraryName: BrowserConstants.MSAL_SKU,
            libraryVersion: version,
            extensionName: extensionName,
            extensionVersion: this.nativeMessageHandler.getExtensionVersion(),
        });
    }
    /**
     * Adds SKUs to request extra query parameters
     * @param request {NativeTokenRequest}
     * @private
     */
    addRequestSKUs(request) {
        request.extraParameters = {
            ...request.extraParameters,
            [AADServerParamKeys.X_CLIENT_EXTRA_SKU]: this.skus,
        };
    }
    /**
     * Acquire token from native platform via browser extension
     * @param request
     */
    async acquireToken(request) {
        this.performanceClient.addQueueMeasurement(PerformanceEvents.NativeInteractionClientAcquireToken, request.correlationId);
        this.logger.trace("NativeInteractionClient - acquireToken called.");
        // start the perf measurement
        const nativeATMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.NativeInteractionClientAcquireToken, request.correlationId);
        const reqTimestamp = TimeUtils.nowSeconds();
        try {
            // initialize native request
            const nativeRequest = await this.initializeNativeRequest(request);
            // check if the tokens can be retrieved from internal cache
            try {
                const result = await this.acquireTokensFromCache(this.accountId, nativeRequest);
                nativeATMeasurement.end({
                    success: true,
                    isNativeBroker: false,
                    fromCache: true,
                });
                return result;
            }
            catch (e) {
                // continue with a native call for any and all errors
                this.logger.info("MSAL internal Cache does not contain tokens, proceed to make a native call");
            }
            const { ...nativeTokenRequest } = nativeRequest;
            // fall back to native calls
            const messageBody = {
                method: NativeExtensionMethod.GetToken,
                request: nativeTokenRequest,
            };
            const response = await this.nativeMessageHandler.sendMessage(messageBody);
            const validatedResponse = this.validateNativeResponse(response);
            return await this.handleNativeResponse(validatedResponse, nativeRequest, reqTimestamp)
                .then((result) => {
                nativeATMeasurement.end({
                    success: true,
                    isNativeBroker: true,
                    requestId: result.requestId,
                });
                this.serverTelemetryManager.clearNativeBrokerErrorCode();
                return result;
            })
                .catch((error) => {
                nativeATMeasurement.end({
                    success: false,
                    errorCode: error.errorCode,
                    subErrorCode: error.subError,
                    isNativeBroker: true,
                });
                throw error;
            });
        }
        catch (e) {
            if (e instanceof NativeAuthError) {
                this.serverTelemetryManager.setNativeBrokerErrorCode(e.errorCode);
            }
            throw e;
        }
    }
    /**
     * Creates silent flow request
     * @param request
     * @param cachedAccount
     * @returns CommonSilentFlowRequest
     */
    createSilentCacheRequest(request, cachedAccount) {
        return {
            authority: request.authority,
            correlationId: this.correlationId,
            scopes: ScopeSet.fromString(request.scope).asArray(),
            account: cachedAccount,
            forceRefresh: false,
        };
    }
    /**
     * Fetches the tokens from the cache if un-expired
     * @param nativeAccountId
     * @param request
     * @returns authenticationResult
     */
    async acquireTokensFromCache(nativeAccountId, request) {
        if (!nativeAccountId) {
            this.logger.warning("NativeInteractionClient:acquireTokensFromCache - No nativeAccountId provided");
            throw createClientAuthError(ClientAuthErrorCodes.noAccountFound);
        }
        // fetch the account from browser cache
        const account = this.browserStorage.getBaseAccountInfo({
            nativeAccountId,
        });
        if (!account) {
            throw createClientAuthError(ClientAuthErrorCodes.noAccountFound);
        }
        // leverage silent flow for cached tokens retrieval
        try {
            const silentRequest = this.createSilentCacheRequest(request, account);
            const result = await this.silentCacheClient.acquireToken(silentRequest);
            const fullAccount = {
                ...account,
                idTokenClaims: result?.idTokenClaims,
                idToken: result?.idToken,
            };
            return {
                ...result,
                account: fullAccount,
            };
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * Acquires a token from native platform then redirects to the redirectUri instead of returning the response
     * @param {RedirectRequest} request
     * @param {InProgressPerformanceEvent} rootMeasurement
     */
    async acquireTokenRedirect(request, rootMeasurement) {
        this.logger.trace("NativeInteractionClient - acquireTokenRedirect called.");
        const { ...remainingParameters } = request;
        delete remainingParameters.onRedirectNavigate;
        const nativeRequest = await this.initializeNativeRequest(remainingParameters);
        const messageBody = {
            method: NativeExtensionMethod.GetToken,
            request: nativeRequest,
        };
        try {
            const response = await this.nativeMessageHandler.sendMessage(messageBody);
            this.validateNativeResponse(response);
        }
        catch (e) {
            // Only throw fatal errors here to allow application to fallback to regular redirect. Otherwise proceed and the error will be thrown in handleRedirectPromise
            if (e instanceof NativeAuthError) {
                this.serverTelemetryManager.setNativeBrokerErrorCode(e.errorCode);
                if (isFatalNativeAuthError(e)) {
                    throw e;
                }
            }
        }
        this.browserStorage.setTemporaryCache(TemporaryCacheKeys.NATIVE_REQUEST, JSON.stringify(nativeRequest), true);
        const navigationOptions = {
            apiId: ApiId.acquireTokenRedirect,
            timeout: this.config.system.redirectNavigationTimeout,
            noHistory: false,
        };
        const redirectUri = this.config.auth.navigateToLoginRequestUrl
            ? window.location.href
            : this.getRedirectUri(request.redirectUri);
        rootMeasurement.end({ success: true });
        await this.navigationClient.navigateExternal(redirectUri, navigationOptions); // Need to treat this as external to ensure handleRedirectPromise is run again
    }
    /**
     * If the previous page called native platform for a token using redirect APIs, send the same request again and return the response
     * @param performanceClient {IPerformanceClient?}
     * @param correlationId {string?} correlation identifier
     */
    async handleRedirectPromise(performanceClient, correlationId) {
        this.logger.trace("NativeInteractionClient - handleRedirectPromise called.");
        if (!this.browserStorage.isInteractionInProgress(true)) {
            this.logger.info("handleRedirectPromise called but there is no interaction in progress, returning null.");
            return null;
        }
        // remove prompt from the request to prevent WAM from prompting twice
        const cachedRequest = this.browserStorage.getCachedNativeRequest();
        if (!cachedRequest) {
            this.logger.verbose("NativeInteractionClient - handleRedirectPromise called but there is no cached request, returning null.");
            if (performanceClient && correlationId) {
                performanceClient?.addFields({ errorCode: "no_cached_request" }, correlationId);
            }
            return null;
        }
        const { prompt, ...request } = cachedRequest;
        if (prompt) {
            this.logger.verbose("NativeInteractionClient - handleRedirectPromise called and prompt was included in the original request, removing prompt from cached request to prevent second interaction with native broker window.");
        }
        this.browserStorage.removeItem(this.browserStorage.generateCacheKey(TemporaryCacheKeys.NATIVE_REQUEST));
        const messageBody = {
            method: NativeExtensionMethod.GetToken,
            request: request,
        };
        const reqTimestamp = TimeUtils.nowSeconds();
        try {
            this.logger.verbose("NativeInteractionClient - handleRedirectPromise sending message to native broker.");
            const response = await this.nativeMessageHandler.sendMessage(messageBody);
            this.validateNativeResponse(response);
            const result = this.handleNativeResponse(response, request, reqTimestamp);
            this.browserStorage.setInteractionInProgress(false);
            const res = await result;
            this.serverTelemetryManager.clearNativeBrokerErrorCode();
            return res;
        }
        catch (e) {
            this.browserStorage.setInteractionInProgress(false);
            throw e;
        }
    }
    /**
     * Logout from native platform via browser extension
     * @param request
     */
    logout() {
        this.logger.trace("NativeInteractionClient - logout called.");
        return Promise.reject("Logout not implemented yet");
    }
    /**
     * Transform response from native platform into AuthenticationResult object which will be returned to the end user
     * @param response
     * @param request
     * @param reqTimestamp
     */
    async handleNativeResponse(response, request, reqTimestamp) {
        this.logger.trace("NativeInteractionClient - handleNativeResponse called.");
        // generate identifiers
        const idTokenClaims = AuthToken.extractTokenClaims(response.id_token, base64Decode);
        const homeAccountIdentifier = this.createHomeAccountIdentifier(response, idTokenClaims);
        const cachedhomeAccountId = this.browserStorage.getAccountInfoFilteredBy({
            nativeAccountId: request.accountId,
        })?.homeAccountId;
        if (homeAccountIdentifier !== cachedhomeAccountId &&
            response.account.id !== request.accountId) {
            // User switch in native broker prompt is not supported. All users must first sign in through web flow to ensure server state is in sync
            throw createNativeAuthError(userSwitch);
        }
        // Get the preferred_cache domain for the given authority
        const authority = await this.getDiscoveredAuthority({
            requestAuthority: request.authority,
        });
        const baseAccount = buildAccountToCache(this.browserStorage, authority, homeAccountIdentifier, base64Decode, idTokenClaims, response.client_info, undefined, // environment
        idTokenClaims.tid, undefined, // auth code payload
        response.account.id, this.logger);
        // generate authenticationResult
        const result = await this.generateAuthenticationResult(response, request, idTokenClaims, baseAccount, authority.canonicalAuthority, reqTimestamp);
        // cache accounts and tokens in the appropriate storage
        await this.cacheAccount(baseAccount);
        await this.cacheNativeTokens(response, request, homeAccountIdentifier, idTokenClaims, response.access_token, result.tenantId, reqTimestamp);
        return result;
    }
    /**
     * creates an homeAccountIdentifier for the account
     * @param response
     * @param idTokenObj
     * @returns
     */
    createHomeAccountIdentifier(response, idTokenClaims) {
        // Save account in browser storage
        const homeAccountIdentifier = AccountEntity.generateHomeAccountId(response.client_info || Constants.EMPTY_STRING, AuthorityType.Default, this.logger, this.browserCrypto, idTokenClaims);
        return homeAccountIdentifier;
    }
    /**
     * Helper to generate scopes
     * @param response
     * @param request
     * @returns
     */
    generateScopes(response, request) {
        return response.scope
            ? ScopeSet.fromString(response.scope)
            : ScopeSet.fromString(request.scope);
    }
    /**
     * If PoP token is requesred, records the PoP token if returned from the WAM, else generates one in the browser
     * @param request
     * @param response
     */
    async generatePopAccessToken(response, request) {
        if (request.tokenType === AuthenticationScheme.POP &&
            request.signPopToken) {
            /**
             * This code prioritizes SHR returned from the native layer. In case of error/SHR not calculated from WAM and the AT
             * is still received, SHR is calculated locally
             */
            // Check if native layer returned an SHR token
            if (response.shr) {
                this.logger.trace("handleNativeServerResponse: SHR is enabled in native layer");
                return response.shr;
            }
            // Generate SHR in msal js if WAM does not compute it when POP is enabled
            const popTokenGenerator = new PopTokenGenerator(this.browserCrypto);
            const shrParameters = {
                resourceRequestMethod: request.resourceRequestMethod,
                resourceRequestUri: request.resourceRequestUri,
                shrClaims: request.shrClaims,
                shrNonce: request.shrNonce,
            };
            /**
             * KeyID must be present in the native request from when the PoP key was generated in order for
             * PopTokenGenerator to query the full key for signing
             */
            if (!request.keyId) {
                throw createClientAuthError(ClientAuthErrorCodes.keyIdMissing);
            }
            return popTokenGenerator.signPopToken(response.access_token, request.keyId, shrParameters);
        }
        else {
            return response.access_token;
        }
    }
    /**
     * Generates authentication result
     * @param response
     * @param request
     * @param idTokenObj
     * @param accountEntity
     * @param authority
     * @param reqTimestamp
     * @returns
     */
    async generateAuthenticationResult(response, request, idTokenClaims, accountEntity, authority, reqTimestamp) {
        // Add Native Broker fields to Telemetry
        const mats = this.addTelemetryFromNativeResponse(response);
        // If scopes not returned in server response, use request scopes
        const responseScopes = response.scope
            ? ScopeSet.fromString(response.scope)
            : ScopeSet.fromString(request.scope);
        const accountProperties = response.account.properties || {};
        const uid = accountProperties["UID"] ||
            idTokenClaims.oid ||
            idTokenClaims.sub ||
            Constants.EMPTY_STRING;
        const tid = accountProperties["TenantId"] ||
            idTokenClaims.tid ||
            Constants.EMPTY_STRING;
        const accountInfo = updateAccountTenantProfileData(accountEntity.getAccountInfo(), undefined, // tenantProfile optional
        idTokenClaims, response.id_token);
        /**
         * In pairwise broker flows, this check prevents the broker's native account id
         * from being returned over the embedded app's account id.
         */
        if (accountInfo.nativeAccountId !== response.account.id) {
            accountInfo.nativeAccountId = response.account.id;
        }
        // generate PoP token as needed
        const responseAccessToken = await this.generatePopAccessToken(response, request);
        const tokenType = request.tokenType === AuthenticationScheme.POP
            ? AuthenticationScheme.POP
            : AuthenticationScheme.BEARER;
        const result = {
            authority: authority,
            uniqueId: uid,
            tenantId: tid,
            scopes: responseScopes.asArray(),
            account: accountInfo,
            idToken: response.id_token,
            idTokenClaims: idTokenClaims,
            accessToken: responseAccessToken,
            fromCache: mats ? this.isResponseFromCache(mats) : false,
            expiresOn: new Date(Number(reqTimestamp + response.expires_in) * 1000),
            tokenType: tokenType,
            correlationId: this.correlationId,
            state: response.state,
            fromNativeBroker: true,
        };
        return result;
    }
    /**
     * cache the account entity in browser storage
     * @param accountEntity
     */
    async cacheAccount(accountEntity) {
        // Store the account info and hence `nativeAccountId` in browser cache
        await this.browserStorage.setAccount(accountEntity, this.correlationId);
        // Remove any existing cached tokens for this account in browser storage
        this.browserStorage.removeAccountContext(accountEntity).catch((e) => {
            this.logger.error(`Error occurred while removing account context from browser storage. ${e}`);
        });
    }
    /**
     * Stores the access_token and id_token in inmemory storage
     * @param response
     * @param request
     * @param homeAccountIdentifier
     * @param idTokenObj
     * @param responseAccessToken
     * @param tenantId
     * @param reqTimestamp
     */
    cacheNativeTokens(response, request, homeAccountIdentifier, idTokenClaims, responseAccessToken, tenantId, reqTimestamp) {
        const cachedIdToken = CacheHelpers.createIdTokenEntity(homeAccountIdentifier, request.authority, response.id_token || "", request.clientId, idTokenClaims.tid || "");
        // cache accessToken in inmemory storage
        const expiresIn = request.tokenType === AuthenticationScheme.POP
            ? Constants.SHR_NONCE_VALIDITY
            : (typeof response.expires_in === "string"
                ? parseInt(response.expires_in, 10)
                : response.expires_in) || 0;
        const tokenExpirationSeconds = reqTimestamp + expiresIn;
        const responseScopes = this.generateScopes(response, request);
        const cachedAccessToken = CacheHelpers.createAccessTokenEntity(homeAccountIdentifier, request.authority, responseAccessToken, request.clientId, idTokenClaims.tid || tenantId, responseScopes.printScopes(), tokenExpirationSeconds, 0, base64Decode, undefined, request.tokenType, undefined, request.keyId);
        const nativeCacheRecord = {
            idToken: cachedIdToken,
            accessToken: cachedAccessToken,
        };
        return this.nativeStorageManager.saveCacheRecord(nativeCacheRecord, this.correlationId, request.storeInCache);
    }
    addTelemetryFromNativeResponse(response) {
        const mats = this.getMATSFromResponse(response);
        if (!mats) {
            return null;
        }
        this.performanceClient.addFields({
            extensionId: this.nativeMessageHandler.getExtensionId(),
            extensionVersion: this.nativeMessageHandler.getExtensionVersion(),
            matsBrokerVersion: mats.broker_version,
            matsAccountJoinOnStart: mats.account_join_on_start,
            matsAccountJoinOnEnd: mats.account_join_on_end,
            matsDeviceJoin: mats.device_join,
            matsPromptBehavior: mats.prompt_behavior,
            matsApiErrorCode: mats.api_error_code,
            matsUiVisible: mats.ui_visible,
            matsSilentCode: mats.silent_code,
            matsSilentBiSubCode: mats.silent_bi_sub_code,
            matsSilentMessage: mats.silent_message,
            matsSilentStatus: mats.silent_status,
            matsHttpStatus: mats.http_status,
            matsHttpEventCount: mats.http_event_count,
        }, this.correlationId);
        return mats;
    }
    /**
     * Validates native platform response before processing
     * @param response
     */
    validateNativeResponse(response) {
        if (response.hasOwnProperty("access_token") &&
            response.hasOwnProperty("id_token") &&
            response.hasOwnProperty("client_info") &&
            response.hasOwnProperty("account") &&
            response.hasOwnProperty("scope") &&
            response.hasOwnProperty("expires_in")) {
            return response;
        }
        else {
            throw createAuthError(AuthErrorCodes.unexpectedError, "Response missing expected properties.");
        }
    }
    /**
     * Gets MATS telemetry from native response
     * @param response
     * @returns
     */
    getMATSFromResponse(response) {
        if (response.properties.MATS) {
            try {
                return JSON.parse(response.properties.MATS);
            }
            catch (e) {
                this.logger.error("NativeInteractionClient - Error parsing MATS telemetry, returning null instead");
            }
        }
        return null;
    }
    /**
     * Returns whether or not response came from native cache
     * @param response
     * @returns
     */
    isResponseFromCache(mats) {
        if (typeof mats.is_cached === "undefined") {
            this.logger.verbose("NativeInteractionClient - MATS telemetry does not contain field indicating if response was served from cache. Returning false.");
            return false;
        }
        return !!mats.is_cached;
    }
    /**
     * Translates developer provided request object into NativeRequest object
     * @param request
     */
    async initializeNativeRequest(request) {
        this.logger.trace("NativeInteractionClient - initializeNativeRequest called");
        const requestAuthority = request.authority || this.config.auth.authority;
        if (request.account) {
            // validate authority
            await this.getDiscoveredAuthority({
                requestAuthority,
                requestAzureCloudOptions: request.azureCloudOptions,
                account: request.account,
            });
        }
        const canonicalAuthority = new UrlString(requestAuthority);
        canonicalAuthority.validateAsUri();
        // scopes are expected to be received by the native broker as "scope" and will be added to the request below. Other properties that should be dropped from the request to the native broker can be included in the object destructuring here.
        const { scopes, ...remainingProperties } = request;
        const scopeSet = new ScopeSet(scopes || []);
        scopeSet.appendScopes(OIDC_DEFAULT_SCOPES);
        const getPrompt = () => {
            // If request is silent, prompt is always none
            switch (this.apiId) {
                case ApiId.ssoSilent:
                case ApiId.acquireTokenSilent_silentFlow:
                    this.logger.trace("initializeNativeRequest: silent request sets prompt to none");
                    return PromptValue.NONE;
            }
            // Prompt not provided, request may proceed and native broker decides if it needs to prompt
            if (!request.prompt) {
                this.logger.trace("initializeNativeRequest: prompt was not provided");
                return undefined;
            }
            // If request is interactive, check if prompt provided is allowed to go directly to native broker
            switch (request.prompt) {
                case PromptValue.NONE:
                case PromptValue.CONSENT:
                case PromptValue.LOGIN:
                    this.logger.trace("initializeNativeRequest: prompt is compatible with native flow");
                    return request.prompt;
                default:
                    this.logger.trace(`initializeNativeRequest: prompt = ${request.prompt} is not compatible with native flow`);
                    throw createBrowserAuthError(nativePromptNotSupported);
            }
        };
        const validatedRequest = {
            ...remainingProperties,
            accountId: this.accountId,
            clientId: this.config.auth.clientId,
            authority: canonicalAuthority.urlString,
            scope: scopeSet.printScopes(),
            redirectUri: this.getRedirectUri(request.redirectUri),
            prompt: getPrompt(),
            correlationId: this.correlationId,
            tokenType: request.authenticationScheme,
            windowTitleSubstring: document.title,
            extraParameters: {
                ...request.extraQueryParameters,
                ...request.tokenQueryParameters,
            },
            extendedExpiryToken: false,
            keyId: request.popKid,
        };
        // Check for PoP token requests: signPopToken should only be set to true if popKid is not set
        if (validatedRequest.signPopToken && !!request.popKid) {
            throw createBrowserAuthError(invalidPopTokenRequest);
        }
        this.handleExtraBrokerParams(validatedRequest);
        validatedRequest.extraParameters =
            validatedRequest.extraParameters || {};
        validatedRequest.extraParameters.telemetry =
            NativeConstants.MATS_TELEMETRY;
        if (request.authenticationScheme === AuthenticationScheme.POP) {
            // add POP request type
            const shrParameters = {
                resourceRequestUri: request.resourceRequestUri,
                resourceRequestMethod: request.resourceRequestMethod,
                shrClaims: request.shrClaims,
                shrNonce: request.shrNonce,
            };
            const popTokenGenerator = new PopTokenGenerator(this.browserCrypto);
            // generate reqCnf if not provided in the request
            let reqCnfData;
            if (!validatedRequest.keyId) {
                const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, this.logger, this.performanceClient, request.correlationId)(shrParameters, this.logger);
                reqCnfData = generatedReqCnfData.reqCnfString;
                validatedRequest.keyId = generatedReqCnfData.kid;
                validatedRequest.signPopToken = true;
            }
            else {
                reqCnfData = this.browserCrypto.base64UrlEncode(JSON.stringify({ kid: validatedRequest.keyId }));
                validatedRequest.signPopToken = false;
            }
            // SPAs require whole string to be passed to broker
            validatedRequest.reqCnf = reqCnfData;
        }
        this.addRequestSKUs(validatedRequest);
        return validatedRequest;
    }
    /**
     * Handles extra broker request parameters
     * @param request {NativeTokenRequest}
     * @private
     */
    handleExtraBrokerParams(request) {
        const hasExtraBrokerParams = request.extraParameters &&
            request.extraParameters.hasOwnProperty(AADServerParamKeys.BROKER_CLIENT_ID) &&
            request.extraParameters.hasOwnProperty(AADServerParamKeys.BROKER_REDIRECT_URI) &&
            request.extraParameters.hasOwnProperty(AADServerParamKeys.CLIENT_ID);
        if (!request.embeddedClientId && !hasExtraBrokerParams) {
            return;
        }
        let child_client_id = "";
        const child_redirect_uri = request.redirectUri;
        if (request.embeddedClientId) {
            request.redirectUri = this.config.auth.redirectUri;
            child_client_id = request.embeddedClientId;
        }
        else if (request.extraParameters) {
            request.redirectUri =
                request.extraParameters[AADServerParamKeys.BROKER_REDIRECT_URI];
            child_client_id =
                request.extraParameters[AADServerParamKeys.CLIENT_ID];
        }
        request.extraParameters = {
            child_client_id,
            child_redirect_uri,
        };
        this.performanceClient?.addFields({
            embeddedClientId: child_client_id,
            embeddedRedirectUri: child_redirect_uri,
        }, request.correlationId);
    }
}

export { NativeInteractionClient };
//# sourceMappingURL=NativeInteractionClient.mjs.map
