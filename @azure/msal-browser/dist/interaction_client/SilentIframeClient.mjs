/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { PerformanceEvents, PromptValue, invokeAsync, AuthError, invoke, ProtocolUtils } from '@azure/msal-common/browser';
import { StandardInteractionClient } from './StandardInteractionClient.mjs';
import { createBrowserAuthError } from '../error/BrowserAuthError.mjs';
import { InteractionType, BrowserConstants } from '../utils/BrowserConstants.mjs';
import { initiateAuthRequest, monitorIframeForHash } from '../interaction_handler/SilentHandler.mjs';
import { NativeMessageHandler } from '../broker/nativeBroker/NativeMessageHandler.mjs';
import { NativeInteractionClient } from './NativeInteractionClient.mjs';
import { InteractionHandler } from '../interaction_handler/InteractionHandler.mjs';
import { preconnect } from '../utils/BrowserUtils.mjs';
import { deserializeResponse } from '../response/ResponseHandler.mjs';
import { silentLogoutUnsupported, nativeConnectionNotEstablished } from '../error/BrowserAuthErrorCodes.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class SilentIframeClient extends StandardInteractionClient {
    constructor(config, storageImpl, browserCrypto, logger, eventHandler, navigationClient, apiId, performanceClient, nativeStorageImpl, nativeMessageHandler, correlationId) {
        super(config, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, nativeMessageHandler, correlationId);
        this.apiId = apiId;
        this.nativeStorage = nativeStorageImpl;
    }
    /**
     * Acquires a token silently by opening a hidden iframe to the /authorize endpoint with prompt=none or prompt=no_session
     * @param request
     */
    async acquireToken(request) {
        this.performanceClient.addQueueMeasurement(PerformanceEvents.SilentIframeClientAcquireToken, request.correlationId);
        // Check that we have some SSO data
        if (!request.loginHint &&
            !request.sid &&
            (!request.account || !request.account.username)) {
            this.logger.warning("No user hint provided. The authorization server may need more information to complete this request.");
        }
        // Check the prompt value
        const inputRequest = { ...request };
        if (inputRequest.prompt) {
            if (inputRequest.prompt !== PromptValue.NONE &&
                inputRequest.prompt !== PromptValue.NO_SESSION) {
                this.logger.warning(`SilentIframeClient. Replacing invalid prompt ${inputRequest.prompt} with ${PromptValue.NONE}`);
                inputRequest.prompt = PromptValue.NONE;
            }
        }
        else {
            inputRequest.prompt = PromptValue.NONE;
        }
        // Create silent request
        const silentRequest = await invokeAsync(this.initializeAuthorizationRequest.bind(this), PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest, this.logger, this.performanceClient, request.correlationId)(inputRequest, InteractionType.Silent);
        preconnect(silentRequest.authority);
        const serverTelemetryManager = this.initializeServerTelemetryManager(this.apiId);
        let authClient;
        try {
            // Initialize the client
            authClient = await invokeAsync(this.createAuthCodeClient.bind(this), PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.logger, this.performanceClient, request.correlationId)({
                serverTelemetryManager,
                requestAuthority: silentRequest.authority,
                requestAzureCloudOptions: silentRequest.azureCloudOptions,
                requestExtraQueryParameters: silentRequest.extraQueryParameters,
                account: silentRequest.account,
            });
            return await invokeAsync(this.silentTokenHelper.bind(this), PerformanceEvents.SilentIframeClientTokenHelper, this.logger, this.performanceClient, request.correlationId)(authClient, silentRequest);
        }
        catch (e) {
            if (e instanceof AuthError) {
                e.setCorrelationId(this.correlationId);
                serverTelemetryManager.cacheFailedRequest(e);
            }
            if (!authClient ||
                !(e instanceof AuthError) ||
                e.errorCode !== BrowserConstants.INVALID_GRANT_ERROR) {
                throw e;
            }
            this.performanceClient.addFields({
                retryError: e.errorCode,
            }, this.correlationId);
            const retrySilentRequest = await invokeAsync(this.initializeAuthorizationRequest.bind(this), PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest, this.logger, this.performanceClient, request.correlationId)(inputRequest, InteractionType.Silent);
            return await invokeAsync(this.silentTokenHelper.bind(this), PerformanceEvents.SilentIframeClientTokenHelper, this.logger, this.performanceClient, this.correlationId)(authClient, retrySilentRequest);
        }
    }
    /**
     * Currently Unsupported
     */
    logout() {
        // Synchronous so we must reject
        return Promise.reject(createBrowserAuthError(silentLogoutUnsupported));
    }
    /**
     * Helper which acquires an authorization code silently using a hidden iframe from given url
     * using the scopes requested as part of the id, and exchanges the code for a set of OAuth tokens.
     * @param navigateUrl
     * @param userRequestScopes
     */
    async silentTokenHelper(authClient, silentRequest) {
        const correlationId = silentRequest.correlationId;
        this.performanceClient.addQueueMeasurement(PerformanceEvents.SilentIframeClientTokenHelper, correlationId);
        // Create auth code request and generate PKCE params
        const authCodeRequest = await invokeAsync(this.initializeAuthorizationCodeRequest.bind(this), PerformanceEvents.StandardInteractionClientInitializeAuthorizationCodeRequest, this.logger, this.performanceClient, correlationId)(silentRequest);
        // Create authorize request url
        const navigateUrl = await invokeAsync(authClient.getAuthCodeUrl.bind(authClient), PerformanceEvents.GetAuthCodeUrl, this.logger, this.performanceClient, correlationId)({
            ...silentRequest,
            platformBroker: NativeMessageHandler.isPlatformBrokerAvailable(this.config, this.logger, this.nativeMessageHandler, silentRequest.authenticationScheme),
        });
        // Create silent handler
        const interactionHandler = new InteractionHandler(authClient, this.browserStorage, authCodeRequest, this.logger, this.performanceClient);
        // Get the frame handle for the silent request
        const msalFrame = await invokeAsync(initiateAuthRequest, PerformanceEvents.SilentHandlerInitiateAuthRequest, this.logger, this.performanceClient, correlationId)(navigateUrl, this.performanceClient, this.logger, correlationId, this.config.system.navigateFrameWait);
        const responseType = this.config.auth.OIDCOptions.serverResponseType;
        // Monitor the window for the hash. Return the string value and close the popup when the hash is received. Default timeout is 60 seconds.
        const responseString = await invokeAsync(monitorIframeForHash, PerformanceEvents.SilentHandlerMonitorIframeForHash, this.logger, this.performanceClient, correlationId)(msalFrame, this.config.system.iframeHashTimeout, this.config.system.pollIntervalMilliseconds, this.performanceClient, this.logger, correlationId, responseType);
        const serverParams = invoke(deserializeResponse, PerformanceEvents.DeserializeResponse, this.logger, this.performanceClient, this.correlationId)(responseString, responseType, this.logger);
        if (serverParams.accountId) {
            this.logger.verbose("Account id found in hash, calling WAM for token");
            if (!this.nativeMessageHandler) {
                throw createBrowserAuthError(nativeConnectionNotEstablished);
            }
            const nativeInteractionClient = new NativeInteractionClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.apiId, this.performanceClient, this.nativeMessageHandler, serverParams.accountId, this.browserStorage, correlationId);
            const { userRequestState } = ProtocolUtils.parseRequestState(this.browserCrypto, silentRequest.state);
            return invokeAsync(nativeInteractionClient.acquireToken.bind(nativeInteractionClient), PerformanceEvents.NativeInteractionClientAcquireToken, this.logger, this.performanceClient, correlationId)({
                ...silentRequest,
                state: userRequestState,
                prompt: silentRequest.prompt || PromptValue.NONE,
            });
        }
        // Handle response from hash string
        return invokeAsync(interactionHandler.handleCodeResponse.bind(interactionHandler), PerformanceEvents.HandleCodeResponse, this.logger, this.performanceClient, correlationId)(serverParams, silentRequest);
    }
}

export { SilentIframeClient };
//# sourceMappingURL=SilentIframeClient.mjs.map
