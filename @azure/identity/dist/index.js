'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var logger$m = require('@azure/logger');
var coreClient = require('@azure/core-client');
var coreUtil = require('@azure/core-util');
var coreRestPipeline = require('@azure/core-rest-pipeline');
var coreTracing = require('@azure/core-tracing');
var fs = require('fs');
var os = require('os');
var path = require('path');
var abortController = require('@azure/abort-controller');
var msalCommon = require('@azure/msal-node');
var open = require('open');
var promises = require('fs/promises');
var child_process = require('child_process');
var crypto = require('crypto');
var node_crypto = require('node:crypto');
var promises$1 = require('node:fs/promises');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var msalCommon__namespace = /*#__PURE__*/_interopNamespaceDefault(msalCommon);
var child_process__namespace = /*#__PURE__*/_interopNamespaceDefault(child_process);

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Current version of the `@azure/identity` package.
 */
const SDK_VERSION = `4.6.0`;
/**
 * The default client ID for authentication
 * @internal
 */
// TODO: temporary - this is the Azure CLI clientID - we'll replace it when
// Developer Sign On application is available
// https://github.com/Azure/azure-sdk-for-net/blob/main/sdk/identity/Azure.Identity/src/Constants.cs#L9
const DeveloperSignOnClientId = "04b07795-8ddb-461a-bbee-02f9e1bf7b46";
/**
 * The default tenant for authentication
 * @internal
 */
const DefaultTenantId = "common";
/**
 * A list of known Azure authority hosts
 */
exports.AzureAuthorityHosts = void 0;
(function (AzureAuthorityHosts) {
    /**
     * China-based Azure Authority Host
     */
    AzureAuthorityHosts["AzureChina"] = "https://login.chinacloudapi.cn";
    /**
     * Germany-based Azure Authority Host
     */
    AzureAuthorityHosts["AzureGermany"] = "https://login.microsoftonline.de";
    /**
     * US Government Azure Authority Host
     */
    AzureAuthorityHosts["AzureGovernment"] = "https://login.microsoftonline.us";
    /**
     * Public Cloud Azure Authority Host
     */
    AzureAuthorityHosts["AzurePublicCloud"] = "https://login.microsoftonline.com";
})(exports.AzureAuthorityHosts || (exports.AzureAuthorityHosts = {}));
/**
 * @internal
 * The default authority host.
 */
const DefaultAuthorityHost = exports.AzureAuthorityHosts.AzurePublicCloud;
/**
 * @internal
 * Allow acquiring tokens for any tenant for multi-tentant auth.
 */
const ALL_TENANTS = ["*"];
/**
 * @internal
 */
const CACHE_CAE_SUFFIX = "cae";
/**
 * @internal
 */
const CACHE_NON_CAE_SUFFIX = "nocae";
/**
 * @internal
 *
 * The default name for the cache persistence plugin.
 * Matches the constant defined in the cache persistence package.
 */
const DEFAULT_TOKEN_CACHE_NAME = "msal.cache";

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * The current persistence provider, undefined by default.
 * @internal
 */
let persistenceProvider = undefined;
/**
 * An object that allows setting the persistence provider.
 * @internal
 */
const msalNodeFlowCacheControl = {
    setPersistence(pluginProvider) {
        persistenceProvider = pluginProvider;
    },
};
/**
 * The current native broker provider, undefined by default.
 * @internal
 */
let nativeBrokerInfo = undefined;
/**
 * An object that allows setting the native broker provider.
 * @internal
 */
const msalNodeFlowNativeBrokerControl = {
    setNativeBroker(broker) {
        nativeBrokerInfo = {
            broker,
        };
    },
};
/**
 * Configures plugins, validating that required plugins are available and enabled.
 *
 * Does not create the plugins themselves, but rather returns the configuration that will be used to create them.
 *
 * @param options - options for creating the MSAL client
 * @returns plugin configuration
 */
function generatePluginConfiguration(options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const config = {
        cache: {},
        broker: {
            isEnabled: (_b = (_a = options.brokerOptions) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false,
            enableMsaPassthrough: (_d = (_c = options.brokerOptions) === null || _c === void 0 ? void 0 : _c.legacyEnableMsaPassthrough) !== null && _d !== void 0 ? _d : false,
            parentWindowHandle: (_e = options.brokerOptions) === null || _e === void 0 ? void 0 : _e.parentWindowHandle,
        },
    };
    if ((_f = options.tokenCachePersistenceOptions) === null || _f === void 0 ? void 0 : _f.enabled) {
        if (persistenceProvider === undefined) {
            throw new Error([
                "Persistent token caching was requested, but no persistence provider was configured.",
                "You must install the identity-cache-persistence plugin package (`npm install --save @azure/identity-cache-persistence`)",
                "and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling",
                "`useIdentityPlugin(cachePersistencePlugin)` before using `tokenCachePersistenceOptions`.",
            ].join(" "));
        }
        const cacheBaseName = options.tokenCachePersistenceOptions.name || DEFAULT_TOKEN_CACHE_NAME;
        config.cache.cachePlugin = persistenceProvider(Object.assign({ name: `${cacheBaseName}.${CACHE_NON_CAE_SUFFIX}` }, options.tokenCachePersistenceOptions));
        config.cache.cachePluginCae = persistenceProvider(Object.assign({ name: `${cacheBaseName}.${CACHE_CAE_SUFFIX}` }, options.tokenCachePersistenceOptions));
    }
    if ((_g = options.brokerOptions) === null || _g === void 0 ? void 0 : _g.enabled) {
        if (nativeBrokerInfo === undefined) {
            throw new Error([
                "Broker for WAM was requested to be enabled, but no native broker was configured.",
                "You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`)",
                "and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling",
                "`useIdentityPlugin(createNativeBrokerPlugin())` before using `enableBroker`.",
            ].join(" "));
        }
        config.broker.nativeBrokerPlugin = nativeBrokerInfo.broker;
    }
    return config;
}
/**
 * Wraps generatePluginConfiguration as a writeable property for test stubbing purposes.
 */
const msalPlugins = {
    generatePluginConfiguration,
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * The AzureLogger used for all clients within the identity package
 */
const logger$l = logger$m.createClientLogger("identity");
/**
 * Separates a list of environment variable names into a plain object with two arrays: an array of missing environment variables and another array with assigned environment variables.
 * @param supportedEnvVars - List of environment variable names
 */
function processEnvVars(supportedEnvVars) {
    return supportedEnvVars.reduce((acc, envVariable) => {
        if (process.env[envVariable]) {
            acc.assigned.push(envVariable);
        }
        else {
            acc.missing.push(envVariable);
        }
        return acc;
    }, { missing: [], assigned: [] });
}
/**
 * Formatting the success event on the credentials
 */
function formatSuccess(scope) {
    return `SUCCESS. Scopes: ${Array.isArray(scope) ? scope.join(", ") : scope}.`;
}
/**
 * Formatting the success event on the credentials
 */
function formatError(scope, error) {
    let message = "ERROR.";
    if (scope === null || scope === void 0 ? void 0 : scope.length) {
        message += ` Scopes: ${Array.isArray(scope) ? scope.join(", ") : scope}.`;
    }
    return `${message} Error message: ${typeof error === "string" ? error : error.message}.`;
}
/**
 * Generates a CredentialLoggerInstance.
 *
 * It logs with the format:
 *
 *   `[title] => [message]`
 *
 */
function credentialLoggerInstance(title, parent, log = logger$l) {
    const fullTitle = parent ? `${parent.fullTitle} ${title}` : title;
    function info(message) {
        log.info(`${fullTitle} =>`, message);
    }
    function warning(message) {
        log.warning(`${fullTitle} =>`, message);
    }
    function verbose(message) {
        log.verbose(`${fullTitle} =>`, message);
    }
    function error(message) {
        log.error(`${fullTitle} =>`, message);
    }
    return {
        title,
        fullTitle,
        info,
        warning,
        verbose,
        error,
    };
}
/**
 * Generates a CredentialLogger, which is a logger declared at the credential's constructor, and used at any point in the credential.
 * It has all the properties of a CredentialLoggerInstance, plus other logger instances, one per method.
 *
 * It logs with the format:
 *
 *   `[title] => [message]`
 *   `[title] => getToken() => [message]`
 *
 */
function credentialLogger(title, log = logger$l) {
    const credLogger = credentialLoggerInstance(title, undefined, log);
    return Object.assign(Object.assign({}, credLogger), { parent: log, getToken: credentialLoggerInstance("=> getToken()", credLogger, log) });
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function isErrorResponse(errorResponse) {
    return (errorResponse &&
        typeof errorResponse.error === "string" &&
        typeof errorResponse.error_description === "string");
}
/**
 * The Error.name value of an CredentialUnavailable
 */
const CredentialUnavailableErrorName = "CredentialUnavailableError";
/**
 * This signifies that the credential that was tried in a chained credential
 * was not available to be used as the credential. Rather than treating this as
 * an error that should halt the chain, it's caught and the chain continues
 */
class CredentialUnavailableError extends Error {
    constructor(message, options) {
        // @ts-expect-error - TypeScript does not recognize this until we use ES2022 as the target; however, all our major runtimes do support the `cause` property
        super(message, options);
        this.name = CredentialUnavailableErrorName;
    }
}
/**
 * The Error.name value of an AuthenticationError
 */
const AuthenticationErrorName = "AuthenticationError";
/**
 * Provides details about a failure to authenticate with Azure Active
 * Directory.  The `errorResponse` field contains more details about
 * the specific failure.
 */
class AuthenticationError extends Error {
    constructor(statusCode, errorBody, options) {
        let errorResponse = {
            error: "unknown",
            errorDescription: "An unknown error occurred and no additional details are available.",
        };
        if (isErrorResponse(errorBody)) {
            errorResponse = convertOAuthErrorResponseToErrorResponse(errorBody);
        }
        else if (typeof errorBody === "string") {
            try {
                // Most error responses will contain JSON-formatted error details
                // in the response body
                const oauthErrorResponse = JSON.parse(errorBody);
                errorResponse = convertOAuthErrorResponseToErrorResponse(oauthErrorResponse);
            }
            catch (e) {
                if (statusCode === 400) {
                    errorResponse = {
                        error: "invalid_request",
                        errorDescription: `The service indicated that the request was invalid.\n\n${errorBody}`,
                    };
                }
                else {
                    errorResponse = {
                        error: "unknown_error",
                        errorDescription: `An unknown error has occurred. Response body:\n\n${errorBody}`,
                    };
                }
            }
        }
        else {
            errorResponse = {
                error: "unknown_error",
                errorDescription: "An unknown error occurred and no additional details are available.",
            };
        }
        super(`${errorResponse.error} Status code: ${statusCode}\nMore details:\n${errorResponse.errorDescription},`, 
        // @ts-expect-error - TypeScript does not recognize this until we use ES2022 as the target; however, all our major runtimes do support the `cause` property
        options);
        this.statusCode = statusCode;
        this.errorResponse = errorResponse;
        // Ensure that this type reports the correct name
        this.name = AuthenticationErrorName;
    }
}
/**
 * The Error.name value of an AggregateAuthenticationError
 */
const AggregateAuthenticationErrorName = "AggregateAuthenticationError";
/**
 * Provides an `errors` array containing {@link AuthenticationError} instance
 * for authentication failures from credentials in a {@link ChainedTokenCredential}.
 */
class AggregateAuthenticationError extends Error {
    constructor(errors, errorMessage) {
        const errorDetail = errors.join("\n");
        super(`${errorMessage}\n${errorDetail}`);
        this.errors = errors;
        // Ensure that this type reports the correct name
        this.name = AggregateAuthenticationErrorName;
    }
}
function convertOAuthErrorResponseToErrorResponse(errorBody) {
    return {
        error: errorBody.error,
        errorDescription: errorBody.error_description,
        correlationId: errorBody.correlation_id,
        errorCodes: errorBody.error_codes,
        timestamp: errorBody.timestamp,
        traceId: errorBody.trace_id,
    };
}
/**
 * Error used to enforce authentication after trying to retrieve a token silently.
 */
class AuthenticationRequiredError extends Error {
    constructor(
    /**
     * Optional parameters. A message can be specified. The {@link GetTokenOptions} of the request can also be specified to more easily associate the error with the received parameters.
     */
    options) {
        super(options.message, 
        // @ts-expect-error - TypeScript does not recognize this until we use ES2022 as the target; however, all our major runtimes do support the `cause` property
        options.cause ? { cause: options.cause } : undefined);
        this.scopes = options.scopes;
        this.getTokenOptions = options.getTokenOptions;
        this.name = "AuthenticationRequiredError";
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function createConfigurationErrorMessage(tenantId) {
    return `The current credential is not configured to acquire tokens for tenant ${tenantId}. To enable acquiring tokens for this tenant add it to the AdditionallyAllowedTenants on the credential options, or add "*" to AdditionallyAllowedTenants to allow acquiring tokens for any tenant.`;
}
/**
 * Of getToken contains a tenantId, this functions allows picking this tenantId as the appropriate for authentication,
 * unless multitenant authentication has been disabled through the AZURE_IDENTITY_DISABLE_MULTITENANTAUTH (on Node.js),
 * or unless the original tenant Id is `adfs`.
 * @internal
 */
function processMultiTenantRequest(tenantId, getTokenOptions, additionallyAllowedTenantIds = [], logger) {
    var _a;
    let resolvedTenantId;
    if (process.env.AZURE_IDENTITY_DISABLE_MULTITENANTAUTH) {
        resolvedTenantId = tenantId;
    }
    else if (tenantId === "adfs") {
        resolvedTenantId = tenantId;
    }
    else {
        resolvedTenantId = (_a = getTokenOptions === null || getTokenOptions === void 0 ? void 0 : getTokenOptions.tenantId) !== null && _a !== void 0 ? _a : tenantId;
    }
    if (tenantId &&
        resolvedTenantId !== tenantId &&
        !additionallyAllowedTenantIds.includes("*") &&
        !additionallyAllowedTenantIds.some((t) => t.localeCompare(resolvedTenantId) === 0)) {
        const message = createConfigurationErrorMessage(tenantId);
        logger === null || logger === void 0 ? void 0 : logger.info(message);
        throw new CredentialUnavailableError(message);
    }
    return resolvedTenantId;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * @internal
 */
function checkTenantId(logger, tenantId) {
    if (!tenantId.match(/^[0-9a-zA-Z-.]+$/)) {
        const error = new Error("Invalid tenant id provided. You can locate your tenant id by following the instructions listed here: https://learn.microsoft.com/partner-center/find-ids-and-domain-names.");
        logger.info(formatError("", error));
        throw error;
    }
}
/**
 * @internal
 */
function resolveTenantId(logger, tenantId, clientId) {
    if (tenantId) {
        checkTenantId(logger, tenantId);
        return tenantId;
    }
    if (!clientId) {
        clientId = DeveloperSignOnClientId;
    }
    if (clientId !== DeveloperSignOnClientId) {
        return "common";
    }
    return "organizations";
}
/**
 * @internal
 */
function resolveAdditionallyAllowedTenantIds(additionallyAllowedTenants) {
    if (!additionallyAllowedTenants || additionallyAllowedTenants.length === 0) {
        return [];
    }
    if (additionallyAllowedTenants.includes("*")) {
        return ALL_TENANTS;
    }
    return additionallyAllowedTenants;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function getIdentityTokenEndpointSuffix(tenantId) {
    if (tenantId === "adfs") {
        return "oauth2/token";
    }
    else {
        return "oauth2/v2.0/token";
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Creates a span using the global tracer.
 * @internal
 */
const tracingClient = coreTracing.createTracingClient({
    namespace: "Microsoft.AAD",
    packageName: "@azure/identity",
    packageVersion: SDK_VERSION,
});

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const DefaultScopeSuffix = "/.default";
const imdsHost = "http://169.254.169.254";
const imdsEndpointPath = "/metadata/identity/oauth2/token";
const imdsApiVersion = "2018-02-01";

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Most MSIs send requests to the IMDS endpoint, or a similar endpoint.
 * These are GET requests that require sending a `resource` parameter on the query.
 * This resource can be derived from the scopes received through the getToken call, as long as only one scope is received.
 * Multiple scopes assume that the resulting token will have access to multiple resources, which won't be the case.
 *
 * For that reason, when we encounter multiple scopes, we return undefined.
 * It's up to the individual MSI implementations to throw the errors (which helps us provide less generic errors).
 */
function mapScopesToResource(scopes) {
    let scope = "";
    if (Array.isArray(scopes)) {
        if (scopes.length !== 1) {
            return;
        }
        scope = scopes[0];
    }
    else if (typeof scopes === "string") {
        scope = scopes;
    }
    if (!scope.endsWith(DefaultScopeSuffix)) {
        return scope;
    }
    return scope.substr(0, scope.lastIndexOf(DefaultScopeSuffix));
}
/**
 * Given a token response, return the expiration timestamp as the number of milliseconds from the Unix epoch.
 * @param body - A parsed response body from the authentication endpoint.
 */
function parseExpirationTimestamp(body) {
    if (typeof body.expires_on === "number") {
        return body.expires_on * 1000;
    }
    if (typeof body.expires_on === "string") {
        const asNumber = +body.expires_on;
        if (!isNaN(asNumber)) {
            return asNumber * 1000;
        }
        const asDate = Date.parse(body.expires_on);
        if (!isNaN(asDate)) {
            return asDate;
        }
    }
    if (typeof body.expires_in === "number") {
        return Date.now() + body.expires_in * 1000;
    }
    throw new Error(`Failed to parse token expiration from body. expires_in="${body.expires_in}", expires_on="${body.expires_on}"`);
}
/**
 * Given a token response, return the expiration timestamp as the number of milliseconds from the Unix epoch.
 * @param body - A parsed response body from the authentication endpoint.
 */
function parseRefreshTimestamp(body) {
    if (body.refresh_on) {
        if (typeof body.refresh_on === "number") {
            return body.refresh_on * 1000;
        }
        if (typeof body.refresh_on === "string") {
            const asNumber = +body.refresh_on;
            if (!isNaN(asNumber)) {
                return asNumber * 1000;
            }
            const asDate = Date.parse(body.refresh_on);
            if (!isNaN(asDate)) {
                return asDate;
            }
        }
        throw new Error(`Failed to parse refresh_on from body. refresh_on="${body.refresh_on}"`);
    }
    else {
        return undefined;
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const noCorrelationId = "noCorrelationId";
/**
 * @internal
 */
function getIdentityClientAuthorityHost(options) {
    // The authorityHost can come from options or from the AZURE_AUTHORITY_HOST environment variable.
    let authorityHost = options === null || options === void 0 ? void 0 : options.authorityHost;
    // The AZURE_AUTHORITY_HOST environment variable can only be provided in Node.js.
    if (coreUtil.isNode) {
        authorityHost = authorityHost !== null && authorityHost !== void 0 ? authorityHost : process.env.AZURE_AUTHORITY_HOST;
    }
    // If the authorityHost is not provided, we use the default one from the public cloud: https://login.microsoftonline.com
    return authorityHost !== null && authorityHost !== void 0 ? authorityHost : DefaultAuthorityHost;
}
/**
 * The network module used by the Identity credentials.
 *
 * It allows for credentials to abort any pending request independently of the MSAL flow,
 * by calling to the `abortRequests()` method.
 *
 */
class IdentityClient extends coreClient.ServiceClient {
    constructor(options) {
        var _a, _b;
        const packageDetails = `azsdk-js-identity/${SDK_VERSION}`;
        const userAgentPrefix = ((_a = options === null || options === void 0 ? void 0 : options.userAgentOptions) === null || _a === void 0 ? void 0 : _a.userAgentPrefix)
            ? `${options.userAgentOptions.userAgentPrefix} ${packageDetails}`
            : `${packageDetails}`;
        const baseUri = getIdentityClientAuthorityHost(options);
        if (!baseUri.startsWith("https:")) {
            throw new Error("The authorityHost address must use the 'https' protocol.");
        }
        super(Object.assign(Object.assign({ requestContentType: "application/json; charset=utf-8", retryOptions: {
                maxRetries: 3,
            } }, options), { userAgentOptions: {
                userAgentPrefix,
            }, baseUri }));
        this.allowInsecureConnection = false;
        this.authorityHost = baseUri;
        this.abortControllers = new Map();
        this.allowLoggingAccountIdentifiers = (_b = options === null || options === void 0 ? void 0 : options.loggingOptions) === null || _b === void 0 ? void 0 : _b.allowLoggingAccountIdentifiers;
        // used for WorkloadIdentity
        this.tokenCredentialOptions = Object.assign({}, options);
        // used for ManagedIdentity
        if (options === null || options === void 0 ? void 0 : options.allowInsecureConnection) {
            this.allowInsecureConnection = options.allowInsecureConnection;
        }
    }
    async sendTokenRequest(request) {
        logger$l.info(`IdentityClient: sending token request to [${request.url}]`);
        const response = await this.sendRequest(request);
        if (response.bodyAsText && (response.status === 200 || response.status === 201)) {
            const parsedBody = JSON.parse(response.bodyAsText);
            if (!parsedBody.access_token) {
                return null;
            }
            this.logIdentifiers(response);
            const token = {
                accessToken: {
                    token: parsedBody.access_token,
                    expiresOnTimestamp: parseExpirationTimestamp(parsedBody),
                    refreshAfterTimestamp: parseRefreshTimestamp(parsedBody),
                    tokenType: "Bearer",
                },
                refreshToken: parsedBody.refresh_token,
            };
            logger$l.info(`IdentityClient: [${request.url}] token acquired, expires on ${token.accessToken.expiresOnTimestamp}`);
            return token;
        }
        else {
            const error = new AuthenticationError(response.status, response.bodyAsText);
            logger$l.warning(`IdentityClient: authentication error. HTTP status: ${response.status}, ${error.errorResponse.errorDescription}`);
            throw error;
        }
    }
    async refreshAccessToken(tenantId, clientId, scopes, refreshToken, clientSecret, options = {}) {
        if (refreshToken === undefined) {
            return null;
        }
        logger$l.info(`IdentityClient: refreshing access token with client ID: ${clientId}, scopes: ${scopes} started`);
        const refreshParams = {
            grant_type: "refresh_token",
            client_id: clientId,
            refresh_token: refreshToken,
            scope: scopes,
        };
        if (clientSecret !== undefined) {
            refreshParams.client_secret = clientSecret;
        }
        const query = new URLSearchParams(refreshParams);
        return tracingClient.withSpan("IdentityClient.refreshAccessToken", options, async (updatedOptions) => {
            try {
                const urlSuffix = getIdentityTokenEndpointSuffix(tenantId);
                const request = coreRestPipeline.createPipelineRequest({
                    url: `${this.authorityHost}/${tenantId}/${urlSuffix}`,
                    method: "POST",
                    body: query.toString(),
                    abortSignal: options.abortSignal,
                    headers: coreRestPipeline.createHttpHeaders({
                        Accept: "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                    }),
                    tracingOptions: updatedOptions.tracingOptions,
                });
                const response = await this.sendTokenRequest(request);
                logger$l.info(`IdentityClient: refreshed token for client ID: ${clientId}`);
                return response;
            }
            catch (err) {
                if (err.name === AuthenticationErrorName &&
                    err.errorResponse.error === "interaction_required") {
                    // It's likely that the refresh token has expired, so
                    // return null so that the credential implementation will
                    // initiate the authentication flow again.
                    logger$l.info(`IdentityClient: interaction required for client ID: ${clientId}`);
                    return null;
                }
                else {
                    logger$l.warning(`IdentityClient: failed refreshing token for client ID: ${clientId}: ${err}`);
                    throw err;
                }
            }
        });
    }
    // Here is a custom layer that allows us to abort requests that go through MSAL,
    // since MSAL doesn't allow us to pass options all the way through.
    generateAbortSignal(correlationId) {
        const controller = new AbortController();
        const controllers = this.abortControllers.get(correlationId) || [];
        controllers.push(controller);
        this.abortControllers.set(correlationId, controllers);
        const existingOnAbort = controller.signal.onabort;
        controller.signal.onabort = (...params) => {
            this.abortControllers.set(correlationId, undefined);
            if (existingOnAbort) {
                existingOnAbort.apply(controller.signal, params);
            }
        };
        return controller.signal;
    }
    abortRequests(correlationId) {
        const key = correlationId || noCorrelationId;
        const controllers = [
            ...(this.abortControllers.get(key) || []),
            // MSAL passes no correlation ID to the get requests...
            ...(this.abortControllers.get(noCorrelationId) || []),
        ];
        if (!controllers.length) {
            return;
        }
        for (const controller of controllers) {
            controller.abort();
        }
        this.abortControllers.set(key, undefined);
    }
    getCorrelationId(options) {
        var _a;
        const parameter = (_a = options === null || options === void 0 ? void 0 : options.body) === null || _a === void 0 ? void 0 : _a.split("&").map((part) => part.split("=")).find(([key]) => key === "client-request-id");
        return parameter && parameter.length ? parameter[1] || noCorrelationId : noCorrelationId;
    }
    // The MSAL network module methods follow
    async sendGetRequestAsync(url, options) {
        const request = coreRestPipeline.createPipelineRequest({
            url,
            method: "GET",
            body: options === null || options === void 0 ? void 0 : options.body,
            allowInsecureConnection: this.allowInsecureConnection,
            headers: coreRestPipeline.createHttpHeaders(options === null || options === void 0 ? void 0 : options.headers),
            abortSignal: this.generateAbortSignal(noCorrelationId),
        });
        const response = await this.sendRequest(request);
        this.logIdentifiers(response);
        return {
            body: response.bodyAsText ? JSON.parse(response.bodyAsText) : undefined,
            headers: response.headers.toJSON(),
            status: response.status,
        };
    }
    async sendPostRequestAsync(url, options) {
        const request = coreRestPipeline.createPipelineRequest({
            url,
            method: "POST",
            body: options === null || options === void 0 ? void 0 : options.body,
            headers: coreRestPipeline.createHttpHeaders(options === null || options === void 0 ? void 0 : options.headers),
            allowInsecureConnection: this.allowInsecureConnection,
            // MSAL doesn't send the correlation ID on the get requests.
            abortSignal: this.generateAbortSignal(this.getCorrelationId(options)),
        });
        const response = await this.sendRequest(request);
        this.logIdentifiers(response);
        return {
            body: response.bodyAsText ? JSON.parse(response.bodyAsText) : undefined,
            headers: response.headers.toJSON(),
            status: response.status,
        };
    }
    /**
     *
     * @internal
     */
    getTokenCredentialOptions() {
        return this.tokenCredentialOptions;
    }
    /**
     * If allowLoggingAccountIdentifiers was set on the constructor options
     * we try to log the account identifiers by parsing the received access token.
     *
     * The account identifiers we try to log are:
     * - `appid`: The application or Client Identifier.
     * - `upn`: User Principal Name.
     *   - It might not be available in some authentication scenarios.
     *   - If it's not available, we put a placeholder: "No User Principal Name available".
     * - `tid`: Tenant Identifier.
     * - `oid`: Object Identifier of the authenticated user.
     */
    logIdentifiers(response) {
        if (!this.allowLoggingAccountIdentifiers || !response.bodyAsText) {
            return;
        }
        const unavailableUpn = "No User Principal Name available";
        try {
            const parsed = response.parsedBody || JSON.parse(response.bodyAsText);
            const accessToken = parsed.access_token;
            if (!accessToken) {
                // Without an access token allowLoggingAccountIdentifiers isn't useful.
                return;
            }
            const base64Metadata = accessToken.split(".")[1];
            const { appid, upn, tid, oid } = JSON.parse(Buffer.from(base64Metadata, "base64").toString("utf8"));
            logger$l.info(`[Authenticated account] Client ID: ${appid}. Tenant ID: ${tid}. User Principal Name: ${upn || unavailableUpn}. Object ID (user): ${oid}`);
        }
        catch (e) {
            logger$l.warning("allowLoggingAccountIdentifiers was set, but we couldn't log the account information. Error:", e.message);
        }
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const CommonTenantId = "common";
const AzureAccountClientId = "aebc6443-996d-45c2-90f0-388ff96faa56"; // VSC: 'aebc6443-996d-45c2-90f0-388ff96faa56'
const logger$k = credentialLogger("VisualStudioCodeCredential");
let findCredentials = undefined;
const vsCodeCredentialControl = {
    setVsCodeCredentialFinder(finder) {
        findCredentials = finder;
    },
};
// Map of unsupported Tenant IDs and the errors we will be throwing.
const unsupportedTenantIds = {
    adfs: "The VisualStudioCodeCredential does not support authentication with ADFS tenants.",
};
function checkUnsupportedTenant(tenantId) {
    // If the Tenant ID isn't supported, we throw.
    const unsupportedTenantError = unsupportedTenantIds[tenantId];
    if (unsupportedTenantError) {
        throw new CredentialUnavailableError(unsupportedTenantError);
    }
}
const mapVSCodeAuthorityHosts = {
    AzureCloud: exports.AzureAuthorityHosts.AzurePublicCloud,
    AzureChina: exports.AzureAuthorityHosts.AzureChina,
    AzureGermanCloud: exports.AzureAuthorityHosts.AzureGermany,
    AzureUSGovernment: exports.AzureAuthorityHosts.AzureGovernment,
};
/**
 * Attempts to load a specific property from the VSCode configurations of the current OS.
 * If it fails at any point, returns undefined.
 */
function getPropertyFromVSCode(property) {
    const settingsPath = ["User", "settings.json"];
    // Eventually we can add more folders for more versions of VSCode.
    const vsCodeFolder = "Code";
    const homedir = os.homedir();
    function loadProperty(...pathSegments) {
        const fullPath = path.join(...pathSegments, vsCodeFolder, ...settingsPath);
        const settings = JSON.parse(fs.readFileSync(fullPath, { encoding: "utf8" }));
        return settings[property];
    }
    try {
        let appData;
        switch (process.platform) {
            case "win32":
                appData = process.env.APPDATA;
                return appData ? loadProperty(appData) : undefined;
            case "darwin":
                return loadProperty(homedir, "Library", "Application Support");
            case "linux":
                return loadProperty(homedir, ".config");
            default:
                return;
        }
    }
    catch (e) {
        logger$k.info(`Failed to load the Visual Studio Code configuration file. Error: ${e.message}`);
        return;
    }
}
/**
 * Connects to Azure using the credential provided by the VSCode extension 'Azure Account'.
 * Once the user has logged in via the extension, this credential can share the same refresh token
 * that is cached by the extension.
 *
 * It's a [known issue](https://github.com/Azure/azure-sdk-for-js/issues/20500) that this credential doesn't
 * work with [Azure Account extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account)
 * versions newer than **0.9.11**. A long-term fix to this problem is in progress. In the meantime, consider
 * authenticating with {@link AzureCliCredential}.
 */
class VisualStudioCodeCredential {
    /**
     * Creates an instance of VisualStudioCodeCredential to use for automatically authenticating via VSCode.
     *
     * **Note**: `VisualStudioCodeCredential` is provided by a plugin package:
     * `@azure/identity-vscode`. If this package is not installed and registered
     * using the plugin API (`useIdentityPlugin`), then authentication using
     * `VisualStudioCodeCredential` will not be available.
     *
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(options) {
        // We want to make sure we use the one assigned by the user on the VSCode settings.
        // Or just `AzureCloud` by default.
        this.cloudName = (getPropertyFromVSCode("azure.cloud") || "AzureCloud");
        // Picking an authority host based on the cloud name.
        const authorityHost = mapVSCodeAuthorityHosts[this.cloudName];
        this.identityClient = new IdentityClient(Object.assign({ authorityHost }, options));
        if (options && options.tenantId) {
            checkTenantId(logger$k, options.tenantId);
            this.tenantId = options.tenantId;
        }
        else {
            this.tenantId = CommonTenantId;
        }
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        checkUnsupportedTenant(this.tenantId);
    }
    /**
     * Runs preparations for any further getToken request.
     */
    async prepare() {
        // Attempts to load the tenant from the VSCode configuration file.
        const settingsTenant = getPropertyFromVSCode("azure.tenant");
        if (settingsTenant) {
            this.tenantId = settingsTenant;
        }
        checkUnsupportedTenant(this.tenantId);
    }
    /**
     * Runs preparations for any further getToken, but only once.
     */
    prepareOnce() {
        if (!this.preparePromise) {
            this.preparePromise = this.prepare();
        }
        return this.preparePromise;
    }
    /**
     * Returns the token found by searching VSCode's authentication cache or
     * returns null if no token could be found.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                `TokenCredential` implementation might make.
     */
    async getToken(scopes, options) {
        var _a, _b;
        await this.prepareOnce();
        const tenantId = processMultiTenantRequest(this.tenantId, options, this.additionallyAllowedTenantIds, logger$k) || this.tenantId;
        if (findCredentials === undefined) {
            throw new CredentialUnavailableError([
                "No implementation of `VisualStudioCodeCredential` is available.",
                "You must install the identity-vscode plugin package (`npm install --save-dev @azure/identity-vscode`)",
                "and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling",
                "`useIdentityPlugin(vsCodePlugin)` before creating a `VisualStudioCodeCredential`.",
                "To troubleshoot, visit https://aka.ms/azsdk/js/identity/vscodecredential/troubleshoot.",
            ].join(" "));
        }
        let scopeString = typeof scopes === "string" ? scopes : scopes.join(" ");
        // Check to make sure the scope we get back is a valid scope
        if (!scopeString.match(/^[0-9a-zA-Z-.:/]+$/)) {
            const error = new Error("Invalid scope was specified by the user or calling client");
            logger$k.getToken.info(formatError(scopes, error));
            throw error;
        }
        if (scopeString.indexOf("offline_access") < 0) {
            scopeString += " offline_access";
        }
        // findCredentials returns an array similar to:
        // [
        //   {
        //     account: "",
        //     password: "",
        //   },
        //   /* ... */
        // ]
        const credentials = await findCredentials();
        // If we can't find the credential based on the name, we'll pick the first one available.
        const { password: refreshToken } = (_b = (_a = credentials.find(({ account }) => account === this.cloudName)) !== null && _a !== void 0 ? _a : credentials[0]) !== null && _b !== void 0 ? _b : {};
        if (refreshToken) {
            const tokenResponse = await this.identityClient.refreshAccessToken(tenantId, AzureAccountClientId, scopeString, refreshToken, undefined);
            if (tokenResponse) {
                logger$k.getToken.info(formatSuccess(scopes));
                return tokenResponse.accessToken;
            }
            else {
                const error = new CredentialUnavailableError("Could not retrieve the token associated with Visual Studio Code. Have you connected using the 'Azure Account' extension recently? To troubleshoot, visit https://aka.ms/azsdk/js/identity/vscodecredential/troubleshoot.");
                logger$k.getToken.info(formatError(scopes, error));
                throw error;
            }
        }
        else {
            const error = new CredentialUnavailableError("Could not retrieve the token associated with Visual Studio Code. Did you connect using the 'Azure Account' extension? To troubleshoot, visit https://aka.ms/azsdk/js/identity/vscodecredential/troubleshoot.");
            logger$k.getToken.info(formatError(scopes, error));
            throw error;
        }
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * The context passed to an Identity plugin. This contains objects that
 * plugins can use to set backend implementations.
 * @internal
 */
const pluginContext = {
    cachePluginControl: msalNodeFlowCacheControl,
    nativeBrokerPluginControl: msalNodeFlowNativeBrokerControl,
    vsCodeCredentialControl: vsCodeCredentialControl,
};
/**
 * Extend Azure Identity with additional functionality. Pass a plugin from
 * a plugin package, such as:
 *
 * - `@azure/identity-cache-persistence`: provides persistent token caching
 * - `@azure/identity-vscode`: provides the dependencies of
 *   `VisualStudioCodeCredential` and enables it
 *
 * Example:
 *
 * ```ts snippet:consumer_example
 * import { useIdentityPlugin, DeviceCodeCredential } from "@azure/identity";
 *
 * useIdentityPlugin(cachePersistencePlugin);
 * // The plugin has the capability to extend `DeviceCodeCredential` and to
 * // add middleware to the underlying credentials, such as persistence.
 * const credential = new DeviceCodeCredential({
 *   tokenCachePersistenceOptions: {
 *     enabled: true,
 *   },
 * });
 * ```
 *
 * @param plugin - the plugin to register
 */
function useIdentityPlugin(plugin) {
    plugin(pluginContext);
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * @internal
 */
const logger$j = credentialLogger("IdentityUtils");
/**
 * Latest AuthenticationRecord version
 * @internal
 */
const LatestAuthenticationRecordVersion = "1.0";
/**
 * Ensures the validity of the MSAL token
 * @internal
 */
function ensureValidMsalToken(scopes, msalToken, getTokenOptions) {
    const error = (message) => {
        logger$j.getToken.info(message);
        return new AuthenticationRequiredError({
            scopes: Array.isArray(scopes) ? scopes : [scopes],
            getTokenOptions,
            message,
        });
    };
    if (!msalToken) {
        throw error("No response");
    }
    if (!msalToken.expiresOn) {
        throw error(`Response had no "expiresOn" property.`);
    }
    if (!msalToken.accessToken) {
        throw error(`Response had no "accessToken" property.`);
    }
}
/**
 * Returns the authority host from either the options bag or the AZURE_AUTHORITY_HOST environment variable.
 *
 * Defaults to {@link DefaultAuthorityHost}.
 * @internal
 */
function getAuthorityHost(options) {
    let authorityHost = options === null || options === void 0 ? void 0 : options.authorityHost;
    if (!authorityHost && coreUtil.isNodeLike) {
        authorityHost = process.env.AZURE_AUTHORITY_HOST;
    }
    return authorityHost !== null && authorityHost !== void 0 ? authorityHost : DefaultAuthorityHost;
}
/**
 * Generates a valid authority by combining a host with a tenantId.
 * @internal
 */
function getAuthority(tenantId, host) {
    if (!host) {
        host = DefaultAuthorityHost;
    }
    if (new RegExp(`${tenantId}/?$`).test(host)) {
        return host;
    }
    if (host.endsWith("/")) {
        return host + tenantId;
    }
    else {
        return `${host}/${tenantId}`;
    }
}
/**
 * Generates the known authorities.
 * If the Tenant Id is `adfs`, the authority can't be validated since the format won't match the expected one.
 * For that reason, we have to force MSAL to disable validating the authority
 * by sending it within the known authorities in the MSAL configuration.
 * @internal
 */
function getKnownAuthorities(tenantId, authorityHost, disableInstanceDiscovery) {
    if ((tenantId === "adfs" && authorityHost) || disableInstanceDiscovery) {
        return [authorityHost];
    }
    return [];
}
/**
 * Generates a logger that can be passed to the MSAL clients.
 * @param credLogger - The logger of the credential.
 * @internal
 */
const defaultLoggerCallback = (credLogger, platform = coreUtil.isNode ? "Node" : "Browser") => (level, message, containsPii) => {
    if (containsPii) {
        return;
    }
    switch (level) {
        case msalCommon__namespace.LogLevel.Error:
            credLogger.info(`MSAL ${platform} V2 error: ${message}`);
            return;
        case msalCommon__namespace.LogLevel.Info:
            credLogger.info(`MSAL ${platform} V2 info message: ${message}`);
            return;
        case msalCommon__namespace.LogLevel.Verbose:
            credLogger.info(`MSAL ${platform} V2 verbose message: ${message}`);
            return;
        case msalCommon__namespace.LogLevel.Warning:
            credLogger.info(`MSAL ${platform} V2 warning: ${message}`);
            return;
    }
};
/**
 * @internal
 */
function getMSALLogLevel(logLevel) {
    switch (logLevel) {
        case "error":
            return msalCommon__namespace.LogLevel.Error;
        case "info":
            return msalCommon__namespace.LogLevel.Info;
        case "verbose":
            return msalCommon__namespace.LogLevel.Verbose;
        case "warning":
            return msalCommon__namespace.LogLevel.Warning;
        default:
            // default msal logging level should be Info
            return msalCommon__namespace.LogLevel.Info;
    }
}
/**
 * Handles MSAL errors.
 */
function handleMsalError(scopes, error, getTokenOptions) {
    if (error.name === "AuthError" ||
        error.name === "ClientAuthError" ||
        error.name === "BrowserAuthError") {
        const msalError = error;
        switch (msalError.errorCode) {
            case "endpoints_resolution_error":
                logger$j.info(formatError(scopes, error.message));
                return new CredentialUnavailableError(error.message);
            case "device_code_polling_cancelled":
                return new abortController.AbortError("The authentication has been aborted by the caller.");
            case "consent_required":
            case "interaction_required":
            case "login_required":
                logger$j.info(formatError(scopes, `Authentication returned errorCode ${msalError.errorCode}`));
                break;
            default:
                logger$j.info(formatError(scopes, `Failed to acquire token: ${error.message}`));
                break;
        }
    }
    if (error.name === "ClientConfigurationError" ||
        error.name === "BrowserConfigurationAuthError" ||
        error.name === "AbortError" ||
        error.name === "AuthenticationError") {
        return error;
    }
    if (error.name === "NativeAuthError") {
        logger$j.info(formatError(scopes, `Error from the native broker: ${error.message} with status code: ${error.statusCode}`));
        return error;
    }
    return new AuthenticationRequiredError({ scopes, getTokenOptions, message: error.message });
}
// transformations.ts
function publicToMsal(account) {
    const [environment] = account.authority.match(/([a-z]*\.[a-z]*\.[a-z]*)/) || [""];
    return Object.assign(Object.assign({}, account), { localAccountId: account.homeAccountId, environment });
}
function msalToPublic(clientId, account) {
    const record = {
        authority: getAuthority(account.tenantId, account.environment),
        homeAccountId: account.homeAccountId,
        tenantId: account.tenantId || DefaultTenantId,
        username: account.username,
        clientId,
        version: LatestAuthenticationRecordVersion,
    };
    return record;
}
/**
 * Serializes an `AuthenticationRecord` into a string.
 *
 * The output of a serialized authentication record will contain the following properties:
 *
 * - "authority"
 * - "homeAccountId"
 * - "clientId"
 * - "tenantId"
 * - "username"
 * - "version"
 *
 * To later convert this string to a serialized `AuthenticationRecord`, please use the exported function `deserializeAuthenticationRecord()`.
 */
function serializeAuthenticationRecord(record) {
    return JSON.stringify(record);
}
/**
 * Deserializes a previously serialized authentication record from a string into an object.
 *
 * The input string must contain the following properties:
 *
 * - "authority"
 * - "homeAccountId"
 * - "clientId"
 * - "tenantId"
 * - "username"
 * - "version"
 *
 * If the version we receive is unsupported, an error will be thrown.
 *
 * At the moment, the only available version is: "1.0", which is always set when the authentication record is serialized.
 *
 * @param serializedRecord - Authentication record previously serialized into string.
 * @returns AuthenticationRecord.
 */
function deserializeAuthenticationRecord(serializedRecord) {
    const parsed = JSON.parse(serializedRecord);
    if (parsed.version && parsed.version !== LatestAuthenticationRecordVersion) {
        throw Error("Unsupported AuthenticationRecord version");
    }
    return parsed;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const msiName$1 = "ManagedIdentityCredential - IMDS";
const logger$i = credentialLogger(msiName$1);
/**
 * Generates the options used on the request for an access token.
 */
function prepareRequestOptions(scopes, clientId, resourceId, options) {
    var _a;
    const resource = mapScopesToResource(scopes);
    if (!resource) {
        throw new Error(`${msiName$1}: Multiple scopes are not supported.`);
    }
    const { skipQuery, skipMetadataHeader } = options || {};
    let query = "";
    // Pod Identity will try to process this request even if the Metadata header is missing.
    // We can exclude the request query to ensure no IMDS endpoint tries to process the ping request.
    if (!skipQuery) {
        const queryParameters = {
            resource,
            "api-version": imdsApiVersion,
        };
        if (clientId) {
            queryParameters.client_id = clientId;
        }
        if (resourceId) {
            queryParameters.msi_res_id = resourceId;
        }
        const params = new URLSearchParams(queryParameters);
        query = `?${params.toString()}`;
    }
    const url = new URL(imdsEndpointPath, (_a = process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST) !== null && _a !== void 0 ? _a : imdsHost);
    const rawHeaders = {
        Accept: "application/json",
        Metadata: "true",
    };
    // Remove the Metadata header to invoke a request error from some IMDS endpoints.
    if (skipMetadataHeader) {
        delete rawHeaders.Metadata;
    }
    return {
        // In this case, the `?` should be added in the "query" variable `skipQuery` is not set.
        url: `${url}${query}`,
        method: "GET",
        headers: coreRestPipeline.createHttpHeaders(rawHeaders),
    };
}
/**
 * Defines how to determine whether the Azure IMDS MSI is available, and also how to retrieve a token from the Azure IMDS MSI.
 */
const imdsMsi = {
    name: "imdsMsi",
    async isAvailable({ scopes, identityClient, clientId, resourceId, getTokenOptions = {}, }) {
        const resource = mapScopesToResource(scopes);
        if (!resource) {
            logger$i.info(`${msiName$1}: Unavailable. Multiple scopes are not supported.`);
            return false;
        }
        // if the PodIdentityEndpoint environment variable was set no need to probe the endpoint, it can be assumed to exist
        if (process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST) {
            return true;
        }
        if (!identityClient) {
            throw new Error("Missing IdentityClient");
        }
        const requestOptions = prepareRequestOptions(resource, clientId, resourceId, {
            skipMetadataHeader: true,
            skipQuery: true,
        });
        return tracingClient.withSpan("ManagedIdentityCredential-pingImdsEndpoint", getTokenOptions, async (options) => {
            var _a, _b;
            requestOptions.tracingOptions = options.tracingOptions;
            // Create a request with a timeout since we expect that
            // not having a "Metadata" header should cause an error to be
            // returned quickly from the endpoint, proving its availability.
            const request = coreRestPipeline.createPipelineRequest(requestOptions);
            // Default to 1000 if the default of 0 is used.
            // Negative values can still be used to disable the timeout.
            request.timeout = ((_a = options.requestOptions) === null || _a === void 0 ? void 0 : _a.timeout) || 1000;
            // This MSI uses the imdsEndpoint to get the token, which only uses http://
            request.allowInsecureConnection = true;
            let response;
            try {
                logger$i.info(`${msiName$1}: Pinging the Azure IMDS endpoint`);
                response = await identityClient.sendRequest(request);
            }
            catch (err) {
                // If the request failed, or Node.js was unable to establish a connection,
                // or the host was down, we'll assume the IMDS endpoint isn't available.
                if (coreUtil.isError(err)) {
                    logger$i.verbose(`${msiName$1}: Caught error ${err.name}: ${err.message}`);
                }
                // This is a special case for Docker Desktop which responds with a 403 with a message that contains "A socket operation was attempted to an unreachable network" or "A socket operation was attempted to an unreachable host"
                // rather than just timing out, as expected.
                logger$i.info(`${msiName$1}: The Azure IMDS endpoint is unavailable`);
                return false;
            }
            if (response.status === 403) {
                if ((_b = response.bodyAsText) === null || _b === void 0 ? void 0 : _b.includes("unreachable")) {
                    logger$i.info(`${msiName$1}: The Azure IMDS endpoint is unavailable`);
                    logger$i.info(`${msiName$1}: ${response.bodyAsText}`);
                    return false;
                }
            }
            // If we received any response, the endpoint is available
            logger$i.info(`${msiName$1}: The Azure IMDS endpoint is available`);
            return true;
        });
    },
    async getToken(configuration, getTokenOptions = {}) {
        const { identityClient, scopes, clientId, resourceId } = configuration;
        if (process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST) {
            logger$i.info(`${msiName$1}: Using the Azure IMDS endpoint coming from the environment variable AZURE_POD_IDENTITY_AUTHORITY_HOST=${process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST}.`);
        }
        else {
            logger$i.info(`${msiName$1}: Using the default Azure IMDS endpoint ${imdsHost}.`);
        }
        let nextDelayInMs = configuration.retryConfig.startDelayInMs;
        for (let retries = 0; retries < configuration.retryConfig.maxRetries; retries++) {
            try {
                const request = coreRestPipeline.createPipelineRequest(Object.assign(Object.assign({ abortSignal: getTokenOptions.abortSignal }, prepareRequestOptions(scopes, clientId, resourceId)), { allowInsecureConnection: true }));
                const tokenResponse = await identityClient.sendTokenRequest(request);
                return (tokenResponse && tokenResponse.accessToken) || null;
            }
            catch (error) {
                if (error.statusCode === 404) {
                    await coreUtil.delay(nextDelayInMs);
                    nextDelayInMs *= configuration.retryConfig.intervalIncrement;
                    continue;
                }
                throw error;
            }
        }
        throw new AuthenticationError(404, `${msiName$1}: Failed to retrieve IMDS token after ${configuration.retryConfig.maxRetries} retries.`);
    },
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Matches the default retry configuration in expontentialRetryStrategy.ts
const DEFAULT_CLIENT_MAX_RETRY_INTERVAL = 1000 * 64;
/**
 * An additional policy that retries on 404 errors. The default retry policy does not retry on
 * 404s, but the IMDS endpoint can return 404s when the token is not yet available. This policy
 * will retry on 404s with an exponential backoff.
 *
 * @param msiRetryConfig - The retry configuration for the MSI credential.
 * @returns - The policy that will retry on 404s.
 */
function imdsRetryPolicy(msiRetryConfig) {
    return coreRestPipeline.retryPolicy([
        {
            name: "imdsRetryPolicy",
            retry: ({ retryCount, response }) => {
                if ((response === null || response === void 0 ? void 0 : response.status) !== 404) {
                    return { skipStrategy: true };
                }
                return coreUtil.calculateRetryDelay(retryCount, {
                    retryDelayInMs: msiRetryConfig.startDelayInMs,
                    maxRetryDelayInMs: DEFAULT_CLIENT_MAX_RETRY_INTERVAL,
                });
            },
        },
    ], {
        maxRetries: msiRetryConfig.maxRetries,
    });
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Helps specify a regional authority, or "AutoDiscoverRegion" to auto-detect the region.
 */
var RegionalAuthority;
(function (RegionalAuthority) {
    /** Instructs MSAL to attempt to discover the region */
    RegionalAuthority["AutoDiscoverRegion"] = "AutoDiscoverRegion";
    /** Uses the {@link RegionalAuthority} for the Azure 'westus' region. */
    RegionalAuthority["USWest"] = "westus";
    /** Uses the {@link RegionalAuthority} for the Azure 'westus2' region. */
    RegionalAuthority["USWest2"] = "westus2";
    /** Uses the {@link RegionalAuthority} for the Azure 'centralus' region. */
    RegionalAuthority["USCentral"] = "centralus";
    /** Uses the {@link RegionalAuthority} for the Azure 'eastus' region. */
    RegionalAuthority["USEast"] = "eastus";
    /** Uses the {@link RegionalAuthority} for the Azure 'eastus2' region. */
    RegionalAuthority["USEast2"] = "eastus2";
    /** Uses the {@link RegionalAuthority} for the Azure 'northcentralus' region. */
    RegionalAuthority["USNorthCentral"] = "northcentralus";
    /** Uses the {@link RegionalAuthority} for the Azure 'southcentralus' region. */
    RegionalAuthority["USSouthCentral"] = "southcentralus";
    /** Uses the {@link RegionalAuthority} for the Azure 'westcentralus' region. */
    RegionalAuthority["USWestCentral"] = "westcentralus";
    /** Uses the {@link RegionalAuthority} for the Azure 'canadacentral' region. */
    RegionalAuthority["CanadaCentral"] = "canadacentral";
    /** Uses the {@link RegionalAuthority} for the Azure 'canadaeast' region. */
    RegionalAuthority["CanadaEast"] = "canadaeast";
    /** Uses the {@link RegionalAuthority} for the Azure 'brazilsouth' region. */
    RegionalAuthority["BrazilSouth"] = "brazilsouth";
    /** Uses the {@link RegionalAuthority} for the Azure 'northeurope' region. */
    RegionalAuthority["EuropeNorth"] = "northeurope";
    /** Uses the {@link RegionalAuthority} for the Azure 'westeurope' region. */
    RegionalAuthority["EuropeWest"] = "westeurope";
    /** Uses the {@link RegionalAuthority} for the Azure 'uksouth' region. */
    RegionalAuthority["UKSouth"] = "uksouth";
    /** Uses the {@link RegionalAuthority} for the Azure 'ukwest' region. */
    RegionalAuthority["UKWest"] = "ukwest";
    /** Uses the {@link RegionalAuthority} for the Azure 'francecentral' region. */
    RegionalAuthority["FranceCentral"] = "francecentral";
    /** Uses the {@link RegionalAuthority} for the Azure 'francesouth' region. */
    RegionalAuthority["FranceSouth"] = "francesouth";
    /** Uses the {@link RegionalAuthority} for the Azure 'switzerlandnorth' region. */
    RegionalAuthority["SwitzerlandNorth"] = "switzerlandnorth";
    /** Uses the {@link RegionalAuthority} for the Azure 'switzerlandwest' region. */
    RegionalAuthority["SwitzerlandWest"] = "switzerlandwest";
    /** Uses the {@link RegionalAuthority} for the Azure 'germanynorth' region. */
    RegionalAuthority["GermanyNorth"] = "germanynorth";
    /** Uses the {@link RegionalAuthority} for the Azure 'germanywestcentral' region. */
    RegionalAuthority["GermanyWestCentral"] = "germanywestcentral";
    /** Uses the {@link RegionalAuthority} for the Azure 'norwaywest' region. */
    RegionalAuthority["NorwayWest"] = "norwaywest";
    /** Uses the {@link RegionalAuthority} for the Azure 'norwayeast' region. */
    RegionalAuthority["NorwayEast"] = "norwayeast";
    /** Uses the {@link RegionalAuthority} for the Azure 'eastasia' region. */
    RegionalAuthority["AsiaEast"] = "eastasia";
    /** Uses the {@link RegionalAuthority} for the Azure 'southeastasia' region. */
    RegionalAuthority["AsiaSouthEast"] = "southeastasia";
    /** Uses the {@link RegionalAuthority} for the Azure 'japaneast' region. */
    RegionalAuthority["JapanEast"] = "japaneast";
    /** Uses the {@link RegionalAuthority} for the Azure 'japanwest' region. */
    RegionalAuthority["JapanWest"] = "japanwest";
    /** Uses the {@link RegionalAuthority} for the Azure 'australiaeast' region. */
    RegionalAuthority["AustraliaEast"] = "australiaeast";
    /** Uses the {@link RegionalAuthority} for the Azure 'australiasoutheast' region. */
    RegionalAuthority["AustraliaSouthEast"] = "australiasoutheast";
    /** Uses the {@link RegionalAuthority} for the Azure 'australiacentral' region. */
    RegionalAuthority["AustraliaCentral"] = "australiacentral";
    /** Uses the {@link RegionalAuthority} for the Azure 'australiacentral2' region. */
    RegionalAuthority["AustraliaCentral2"] = "australiacentral2";
    /** Uses the {@link RegionalAuthority} for the Azure 'centralindia' region. */
    RegionalAuthority["IndiaCentral"] = "centralindia";
    /** Uses the {@link RegionalAuthority} for the Azure 'southindia' region. */
    RegionalAuthority["IndiaSouth"] = "southindia";
    /** Uses the {@link RegionalAuthority} for the Azure 'westindia' region. */
    RegionalAuthority["IndiaWest"] = "westindia";
    /** Uses the {@link RegionalAuthority} for the Azure 'koreasouth' region. */
    RegionalAuthority["KoreaSouth"] = "koreasouth";
    /** Uses the {@link RegionalAuthority} for the Azure 'koreacentral' region. */
    RegionalAuthority["KoreaCentral"] = "koreacentral";
    /** Uses the {@link RegionalAuthority} for the Azure 'uaecentral' region. */
    RegionalAuthority["UAECentral"] = "uaecentral";
    /** Uses the {@link RegionalAuthority} for the Azure 'uaenorth' region. */
    RegionalAuthority["UAENorth"] = "uaenorth";
    /** Uses the {@link RegionalAuthority} for the Azure 'southafricanorth' region. */
    RegionalAuthority["SouthAfricaNorth"] = "southafricanorth";
    /** Uses the {@link RegionalAuthority} for the Azure 'southafricawest' region. */
    RegionalAuthority["SouthAfricaWest"] = "southafricawest";
    /** Uses the {@link RegionalAuthority} for the Azure 'chinanorth' region. */
    RegionalAuthority["ChinaNorth"] = "chinanorth";
    /** Uses the {@link RegionalAuthority} for the Azure 'chinaeast' region. */
    RegionalAuthority["ChinaEast"] = "chinaeast";
    /** Uses the {@link RegionalAuthority} for the Azure 'chinanorth2' region. */
    RegionalAuthority["ChinaNorth2"] = "chinanorth2";
    /** Uses the {@link RegionalAuthority} for the Azure 'chinaeast2' region. */
    RegionalAuthority["ChinaEast2"] = "chinaeast2";
    /** Uses the {@link RegionalAuthority} for the Azure 'germanycentral' region. */
    RegionalAuthority["GermanyCentral"] = "germanycentral";
    /** Uses the {@link RegionalAuthority} for the Azure 'germanynortheast' region. */
    RegionalAuthority["GermanyNorthEast"] = "germanynortheast";
    /** Uses the {@link RegionalAuthority} for the Azure 'usgovvirginia' region. */
    RegionalAuthority["GovernmentUSVirginia"] = "usgovvirginia";
    /** Uses the {@link RegionalAuthority} for the Azure 'usgoviowa' region. */
    RegionalAuthority["GovernmentUSIowa"] = "usgoviowa";
    /** Uses the {@link RegionalAuthority} for the Azure 'usgovarizona' region. */
    RegionalAuthority["GovernmentUSArizona"] = "usgovarizona";
    /** Uses the {@link RegionalAuthority} for the Azure 'usgovtexas' region. */
    RegionalAuthority["GovernmentUSTexas"] = "usgovtexas";
    /** Uses the {@link RegionalAuthority} for the Azure 'usdodeast' region. */
    RegionalAuthority["GovernmentUSDodEast"] = "usdodeast";
    /** Uses the {@link RegionalAuthority} for the Azure 'usdodcentral' region. */
    RegionalAuthority["GovernmentUSDodCentral"] = "usdodcentral";
})(RegionalAuthority || (RegionalAuthority = {}));
/**
 * Calculates the correct regional authority based on the supplied value
 * and the AZURE_REGIONAL_AUTHORITY_NAME environment variable.
 *
 * Values will be returned verbatim, except for {@link RegionalAuthority.AutoDiscoverRegion}
 * which is mapped to a value MSAL can understand.
 *
 * @internal
 */
function calculateRegionalAuthority(regionalAuthority) {
    // Note: as of today only 3 credentials support regional authority, and the parameter
    // is not exposed via the public API. Regional Authority is _only_ supported
    // via the AZURE_REGIONAL_AUTHORITY_NAME env var and _only_ for: ClientSecretCredential, ClientCertificateCredential, and ClientAssertionCredential.
    var _a, _b;
    // Accepting the regionalAuthority parameter will allow us to support it in the future.
    let azureRegion = regionalAuthority;
    if (azureRegion === undefined &&
        ((_b = (_a = globalThis.process) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.AZURE_REGIONAL_AUTHORITY_NAME) !== undefined) {
        azureRegion = process.env.AZURE_REGIONAL_AUTHORITY_NAME;
    }
    if (azureRegion === RegionalAuthority.AutoDiscoverRegion) {
        return "AUTO_DISCOVER";
    }
    return azureRegion;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * The default logger used if no logger was passed in by the credential.
 */
const msalLogger = credentialLogger("MsalClient");
/**
 * A call to open(), but mockable
 * @internal
 */
const interactiveBrowserMockable = {
    open,
};
/**
 * Generates the configuration for MSAL (Microsoft Authentication Library).
 *
 * @param clientId - The client ID of the application.
 * @param  tenantId - The tenant ID of the Azure Active Directory.
 * @param  msalClientOptions - Optional. Additional options for creating the MSAL client.
 * @returns  The MSAL configuration object.
 */
function generateMsalConfiguration(clientId, tenantId, msalClientOptions = {}) {
    var _a, _b, _c;
    const resolvedTenant = resolveTenantId((_a = msalClientOptions.logger) !== null && _a !== void 0 ? _a : msalLogger, tenantId, clientId);
    // TODO: move and reuse getIdentityClientAuthorityHost
    const authority = getAuthority(resolvedTenant, getAuthorityHost(msalClientOptions));
    const httpClient = new IdentityClient(Object.assign(Object.assign({}, msalClientOptions.tokenCredentialOptions), { authorityHost: authority, loggingOptions: msalClientOptions.loggingOptions }));
    const msalConfig = {
        auth: {
            clientId,
            authority,
            knownAuthorities: getKnownAuthorities(resolvedTenant, authority, msalClientOptions.disableInstanceDiscovery),
        },
        system: {
            networkClient: httpClient,
            loggerOptions: {
                loggerCallback: defaultLoggerCallback((_b = msalClientOptions.logger) !== null && _b !== void 0 ? _b : msalLogger),
                logLevel: getMSALLogLevel(logger$m.getLogLevel()),
                piiLoggingEnabled: (_c = msalClientOptions.loggingOptions) === null || _c === void 0 ? void 0 : _c.enableUnsafeSupportLogging,
            },
        },
    };
    return msalConfig;
}
/**
 * Creates an instance of the MSAL (Microsoft Authentication Library) client.
 *
 * @param clientId - The client ID of the application.
 * @param tenantId - The tenant ID of the Azure Active Directory.
 * @param createMsalClientOptions - Optional. Additional options for creating the MSAL client.
 * @returns An instance of the MSAL client.
 *
 * @public
 */
function createMsalClient(clientId, tenantId, createMsalClientOptions = {}) {
    var _a;
    const state = {
        msalConfig: generateMsalConfiguration(clientId, tenantId, createMsalClientOptions),
        cachedAccount: createMsalClientOptions.authenticationRecord
            ? publicToMsal(createMsalClientOptions.authenticationRecord)
            : null,
        pluginConfiguration: msalPlugins.generatePluginConfiguration(createMsalClientOptions),
        logger: (_a = createMsalClientOptions.logger) !== null && _a !== void 0 ? _a : msalLogger,
    };
    const publicApps = new Map();
    async function getPublicApp(options = {}) {
        const appKey = options.enableCae ? "CAE" : "default";
        let publicClientApp = publicApps.get(appKey);
        if (publicClientApp) {
            state.logger.getToken.info("Existing PublicClientApplication found in cache, returning it.");
            return publicClientApp;
        }
        // Initialize a new app and cache it
        state.logger.getToken.info(`Creating new PublicClientApplication with CAE ${options.enableCae ? "enabled" : "disabled"}.`);
        const cachePlugin = options.enableCae
            ? state.pluginConfiguration.cache.cachePluginCae
            : state.pluginConfiguration.cache.cachePlugin;
        state.msalConfig.auth.clientCapabilities = options.enableCae ? ["cp1"] : undefined;
        publicClientApp = new msalCommon__namespace.PublicClientApplication(Object.assign(Object.assign({}, state.msalConfig), { broker: { nativeBrokerPlugin: state.pluginConfiguration.broker.nativeBrokerPlugin }, cache: { cachePlugin: await cachePlugin } }));
        publicApps.set(appKey, publicClientApp);
        return publicClientApp;
    }
    const confidentialApps = new Map();
    async function getConfidentialApp(options = {}) {
        const appKey = options.enableCae ? "CAE" : "default";
        let confidentialClientApp = confidentialApps.get(appKey);
        if (confidentialClientApp) {
            state.logger.getToken.info("Existing ConfidentialClientApplication found in cache, returning it.");
            return confidentialClientApp;
        }
        // Initialize a new app and cache it
        state.logger.getToken.info(`Creating new ConfidentialClientApplication with CAE ${options.enableCae ? "enabled" : "disabled"}.`);
        const cachePlugin = options.enableCae
            ? state.pluginConfiguration.cache.cachePluginCae
            : state.pluginConfiguration.cache.cachePlugin;
        state.msalConfig.auth.clientCapabilities = options.enableCae ? ["cp1"] : undefined;
        confidentialClientApp = new msalCommon__namespace.ConfidentialClientApplication(Object.assign(Object.assign({}, state.msalConfig), { broker: { nativeBrokerPlugin: state.pluginConfiguration.broker.nativeBrokerPlugin }, cache: { cachePlugin: await cachePlugin } }));
        confidentialApps.set(appKey, confidentialClientApp);
        return confidentialClientApp;
    }
    async function getTokenSilent(app, scopes, options = {}) {
        if (state.cachedAccount === null) {
            state.logger.getToken.info("No cached account found in local state, attempting to load it from MSAL cache.");
            const cache = app.getTokenCache();
            const accounts = await cache.getAllAccounts();
            if (accounts === undefined || accounts.length === 0) {
                throw new AuthenticationRequiredError({ scopes });
            }
            if (accounts.length > 1) {
                state.logger
                    .info(`More than one account was found authenticated for this Client ID and Tenant ID.
However, no "authenticationRecord" has been provided for this credential,
therefore we're unable to pick between these accounts.
A new login attempt will be requested, to ensure the correct account is picked.
To work with multiple accounts for the same Client ID and Tenant ID, please provide an "authenticationRecord" when initializing a credential to prevent this from happening.`);
                throw new AuthenticationRequiredError({ scopes });
            }
            state.cachedAccount = accounts[0];
        }
        // Keep track and reuse the claims we received across challenges
        if (options.claims) {
            state.cachedClaims = options.claims;
        }
        const silentRequest = {
            account: state.cachedAccount,
            scopes,
            claims: state.cachedClaims,
        };
        if (state.pluginConfiguration.broker.isEnabled) {
            silentRequest.tokenQueryParameters || (silentRequest.tokenQueryParameters = {});
            if (state.pluginConfiguration.broker.enableMsaPassthrough) {
                silentRequest.tokenQueryParameters["msal_request_type"] = "consumer_passthrough";
            }
        }
        if (options.proofOfPossessionOptions) {
            silentRequest.shrNonce = options.proofOfPossessionOptions.nonce;
            silentRequest.authenticationScheme = "pop";
            silentRequest.resourceRequestMethod = options.proofOfPossessionOptions.resourceRequestMethod;
            silentRequest.resourceRequestUri = options.proofOfPossessionOptions.resourceRequestUrl;
        }
        state.logger.getToken.info("Attempting to acquire token silently");
        return app.acquireTokenSilent(silentRequest);
    }
    /**
     * Builds an authority URL for the given request. The authority may be different than the one used when creating the MSAL client
     * if the user is creating cross-tenant requests
     */
    function calculateRequestAuthority(options) {
        if (options === null || options === void 0 ? void 0 : options.tenantId) {
            return getAuthority(options.tenantId, getAuthorityHost(createMsalClientOptions));
        }
        return state.msalConfig.auth.authority;
    }
    /**
     * Performs silent authentication using MSAL to acquire an access token.
     * If silent authentication fails, falls back to interactive authentication.
     *
     * @param msalApp - The MSAL application instance.
     * @param scopes - The scopes for which to acquire the access token.
     * @param options - The options for acquiring the access token.
     * @param onAuthenticationRequired - A callback function to handle interactive authentication when silent authentication fails.
     * @returns A promise that resolves to an AccessToken object containing the access token and its expiration timestamp.
     */
    async function withSilentAuthentication(msalApp, scopes, options, onAuthenticationRequired) {
        var _a, _b;
        let response = null;
        try {
            response = await getTokenSilent(msalApp, scopes, options);
        }
        catch (e) {
            if (e.name !== "AuthenticationRequiredError") {
                throw e;
            }
            if (options.disableAutomaticAuthentication) {
                throw new AuthenticationRequiredError({
                    scopes,
                    getTokenOptions: options,
                    message: "Automatic authentication has been disabled. You may call the authentication() method.",
                });
            }
        }
        // Silent authentication failed
        if (response === null) {
            try {
                response = await onAuthenticationRequired();
            }
            catch (err) {
                throw handleMsalError(scopes, err, options);
            }
        }
        // At this point we should have a token, process it
        ensureValidMsalToken(scopes, response, options);
        state.cachedAccount = (_a = response === null || response === void 0 ? void 0 : response.account) !== null && _a !== void 0 ? _a : null;
        state.logger.getToken.info(formatSuccess(scopes));
        return {
            token: response.accessToken,
            expiresOnTimestamp: response.expiresOn.getTime(),
            refreshAfterTimestamp: (_b = response.refreshOn) === null || _b === void 0 ? void 0 : _b.getTime(),
            tokenType: response.tokenType,
        };
    }
    async function getTokenByClientSecret(scopes, clientSecret, options = {}) {
        var _a;
        state.logger.getToken.info(`Attempting to acquire token using client secret`);
        state.msalConfig.auth.clientSecret = clientSecret;
        const msalApp = await getConfidentialApp(options);
        try {
            const response = await msalApp.acquireTokenByClientCredential({
                scopes,
                authority: calculateRequestAuthority(options),
                azureRegion: calculateRegionalAuthority(),
                claims: options === null || options === void 0 ? void 0 : options.claims,
            });
            ensureValidMsalToken(scopes, response, options);
            state.logger.getToken.info(formatSuccess(scopes));
            return {
                token: response.accessToken,
                expiresOnTimestamp: response.expiresOn.getTime(),
                refreshAfterTimestamp: (_a = response.refreshOn) === null || _a === void 0 ? void 0 : _a.getTime(),
                tokenType: response.tokenType,
            };
        }
        catch (err) {
            throw handleMsalError(scopes, err, options);
        }
    }
    async function getTokenByClientAssertion(scopes, clientAssertion, options = {}) {
        var _a;
        state.logger.getToken.info(`Attempting to acquire token using client assertion`);
        state.msalConfig.auth.clientAssertion = clientAssertion;
        const msalApp = await getConfidentialApp(options);
        try {
            const response = await msalApp.acquireTokenByClientCredential({
                scopes,
                authority: calculateRequestAuthority(options),
                azureRegion: calculateRegionalAuthority(),
                claims: options === null || options === void 0 ? void 0 : options.claims,
                clientAssertion,
            });
            ensureValidMsalToken(scopes, response, options);
            state.logger.getToken.info(formatSuccess(scopes));
            return {
                token: response.accessToken,
                expiresOnTimestamp: response.expiresOn.getTime(),
                refreshAfterTimestamp: (_a = response.refreshOn) === null || _a === void 0 ? void 0 : _a.getTime(),
                tokenType: response.tokenType,
            };
        }
        catch (err) {
            throw handleMsalError(scopes, err, options);
        }
    }
    async function getTokenByClientCertificate(scopes, certificate, options = {}) {
        var _a;
        state.logger.getToken.info(`Attempting to acquire token using client certificate`);
        state.msalConfig.auth.clientCertificate = certificate;
        const msalApp = await getConfidentialApp(options);
        try {
            const response = await msalApp.acquireTokenByClientCredential({
                scopes,
                authority: calculateRequestAuthority(options),
                azureRegion: calculateRegionalAuthority(),
                claims: options === null || options === void 0 ? void 0 : options.claims,
            });
            ensureValidMsalToken(scopes, response, options);
            state.logger.getToken.info(formatSuccess(scopes));
            return {
                token: response.accessToken,
                expiresOnTimestamp: response.expiresOn.getTime(),
                refreshAfterTimestamp: (_a = response.refreshOn) === null || _a === void 0 ? void 0 : _a.getTime(),
                tokenType: response.tokenType,
            };
        }
        catch (err) {
            throw handleMsalError(scopes, err, options);
        }
    }
    async function getTokenByDeviceCode(scopes, deviceCodeCallback, options = {}) {
        state.logger.getToken.info(`Attempting to acquire token using device code`);
        const msalApp = await getPublicApp(options);
        return withSilentAuthentication(msalApp, scopes, options, () => {
            var _a, _b;
            const requestOptions = {
                scopes,
                cancel: (_b = (_a = options === null || options === void 0 ? void 0 : options.abortSignal) === null || _a === void 0 ? void 0 : _a.aborted) !== null && _b !== void 0 ? _b : false,
                deviceCodeCallback,
                authority: calculateRequestAuthority(options),
                claims: options === null || options === void 0 ? void 0 : options.claims,
            };
            const deviceCodeRequest = msalApp.acquireTokenByDeviceCode(requestOptions);
            if (options.abortSignal) {
                options.abortSignal.addEventListener("abort", () => {
                    requestOptions.cancel = true;
                });
            }
            return deviceCodeRequest;
        });
    }
    async function getTokenByUsernamePassword(scopes, username, password, options = {}) {
        state.logger.getToken.info(`Attempting to acquire token using username and password`);
        const msalApp = await getPublicApp(options);
        return withSilentAuthentication(msalApp, scopes, options, () => {
            const requestOptions = {
                scopes,
                username,
                password,
                authority: calculateRequestAuthority(options),
                claims: options === null || options === void 0 ? void 0 : options.claims,
            };
            return msalApp.acquireTokenByUsernamePassword(requestOptions);
        });
    }
    function getActiveAccount() {
        if (!state.cachedAccount) {
            return undefined;
        }
        return msalToPublic(clientId, state.cachedAccount);
    }
    async function getTokenByAuthorizationCode(scopes, redirectUri, authorizationCode, clientSecret, options = {}) {
        state.logger.getToken.info(`Attempting to acquire token using authorization code`);
        let msalApp;
        if (clientSecret) {
            // If a client secret is provided, we need to use a confidential client application
            // See https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-access-token-with-a-client_secret
            state.msalConfig.auth.clientSecret = clientSecret;
            msalApp = await getConfidentialApp(options);
        }
        else {
            msalApp = await getPublicApp(options);
        }
        return withSilentAuthentication(msalApp, scopes, options, () => {
            return msalApp.acquireTokenByCode({
                scopes,
                redirectUri,
                code: authorizationCode,
                authority: calculateRequestAuthority(options),
                claims: options === null || options === void 0 ? void 0 : options.claims,
            });
        });
    }
    async function getTokenOnBehalfOf(scopes, userAssertionToken, clientCredentials, options = {}) {
        var _a;
        msalLogger.getToken.info(`Attempting to acquire token on behalf of another user`);
        if (typeof clientCredentials === "string") {
            // Client secret
            msalLogger.getToken.info(`Using client secret for on behalf of flow`);
            state.msalConfig.auth.clientSecret = clientCredentials;
        }
        else if (typeof clientCredentials === "function") {
            // Client Assertion
            msalLogger.getToken.info(`Using client assertion callback for on behalf of flow`);
            state.msalConfig.auth.clientAssertion = clientCredentials;
        }
        else {
            // Client certificate
            msalLogger.getToken.info(`Using client certificate for on behalf of flow`);
            state.msalConfig.auth.clientCertificate = clientCredentials;
        }
        const msalApp = await getConfidentialApp(options);
        try {
            const response = await msalApp.acquireTokenOnBehalfOf({
                scopes,
                authority: calculateRequestAuthority(options),
                claims: options.claims,
                oboAssertion: userAssertionToken,
            });
            ensureValidMsalToken(scopes, response, options);
            msalLogger.getToken.info(formatSuccess(scopes));
            return {
                token: response.accessToken,
                expiresOnTimestamp: response.expiresOn.getTime(),
                refreshAfterTimestamp: (_a = response.refreshOn) === null || _a === void 0 ? void 0 : _a.getTime(),
                tokenType: response.tokenType,
            };
        }
        catch (err) {
            throw handleMsalError(scopes, err, options);
        }
    }
    async function getTokenByInteractiveRequest(scopes, options = {}) {
        msalLogger.getToken.info(`Attempting to acquire token interactively`);
        const app = await getPublicApp(options);
        /**
         * A helper function that supports brokered authentication through the MSAL's public application.
         *
         * When options.useDefaultBrokerAccount is true, the method will attempt to authenticate using the default broker account.
         * If the default broker account is not available, the method will fall back to interactive authentication.
         */
        async function getBrokeredToken(useDefaultBrokerAccount) {
            var _a;
            msalLogger.verbose("Authentication will resume through the broker");
            const interactiveRequest = createBaseInteractiveRequest();
            if (state.pluginConfiguration.broker.parentWindowHandle) {
                interactiveRequest.windowHandle = Buffer.from(state.pluginConfiguration.broker.parentWindowHandle);
            }
            else {
                // this is a bug, as the pluginConfiguration handler should validate this case.
                msalLogger.warning("Parent window handle is not specified for the broker. This may cause unexpected behavior. Please provide the parentWindowHandle.");
            }
            if (state.pluginConfiguration.broker.enableMsaPassthrough) {
                ((_a = interactiveRequest.tokenQueryParameters) !== null && _a !== void 0 ? _a : (interactiveRequest.tokenQueryParameters = {}))["msal_request_type"] =
                    "consumer_passthrough";
            }
            if (useDefaultBrokerAccount) {
                interactiveRequest.prompt = "none";
                msalLogger.verbose("Attempting broker authentication using the default broker account");
            }
            else {
                msalLogger.verbose("Attempting broker authentication without the default broker account");
            }
            if (options.proofOfPossessionOptions) {
                interactiveRequest.shrNonce = options.proofOfPossessionOptions.nonce;
                interactiveRequest.authenticationScheme = "pop";
                interactiveRequest.resourceRequestMethod =
                    options.proofOfPossessionOptions.resourceRequestMethod;
                interactiveRequest.resourceRequestUri = options.proofOfPossessionOptions.resourceRequestUrl;
            }
            try {
                return await app.acquireTokenInteractive(interactiveRequest);
            }
            catch (e) {
                msalLogger.verbose(`Failed to authenticate through the broker: ${e.message}`);
                // If we tried to use the default broker account and failed, fall back to interactive authentication
                if (useDefaultBrokerAccount) {
                    return getBrokeredToken(/* useDefaultBrokerAccount: */ false);
                }
                else {
                    throw e;
                }
            }
        }
        function createBaseInteractiveRequest() {
            var _a, _b;
            return {
                openBrowser: async (url) => {
                    await interactiveBrowserMockable.open(url, { wait: true, newInstance: true });
                },
                scopes,
                authority: calculateRequestAuthority(options),
                claims: options === null || options === void 0 ? void 0 : options.claims,
                loginHint: options === null || options === void 0 ? void 0 : options.loginHint,
                errorTemplate: (_a = options === null || options === void 0 ? void 0 : options.browserCustomizationOptions) === null || _a === void 0 ? void 0 : _a.errorMessage,
                successTemplate: (_b = options === null || options === void 0 ? void 0 : options.browserCustomizationOptions) === null || _b === void 0 ? void 0 : _b.successMessage,
            };
        }
        return withSilentAuthentication(app, scopes, options, async () => {
            var _a;
            const interactiveRequest = createBaseInteractiveRequest();
            if (state.pluginConfiguration.broker.isEnabled) {
                return getBrokeredToken((_a = state.pluginConfiguration.broker.useDefaultBrokerAccount) !== null && _a !== void 0 ? _a : false);
            }
            if (options.proofOfPossessionOptions) {
                interactiveRequest.shrNonce = options.proofOfPossessionOptions.nonce;
                interactiveRequest.authenticationScheme = "pop";
                interactiveRequest.resourceRequestMethod =
                    options.proofOfPossessionOptions.resourceRequestMethod;
                interactiveRequest.resourceRequestUri = options.proofOfPossessionOptions.resourceRequestUrl;
            }
            return app.acquireTokenInteractive(interactiveRequest);
        });
    }
    return {
        getActiveAccount,
        getTokenByClientSecret,
        getTokenByClientAssertion,
        getTokenByClientCertificate,
        getTokenByDeviceCode,
        getTokenByUsernamePassword,
        getTokenByAuthorizationCode,
        getTokenOnBehalfOf,
        getTokenByInteractiveRequest,
    };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$h = credentialLogger("ClientAssertionCredential");
/**
 * Authenticates a service principal with a JWT assertion.
 */
class ClientAssertionCredential {
    /**
     * Creates an instance of the ClientAssertionCredential with the details
     * needed to authenticate against Microsoft Entra ID with a client
     * assertion provided by the developer through the `getAssertion` function parameter.
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param getAssertion - A function that retrieves the assertion for the credential to use.
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId, clientId, getAssertion, options = {}) {
        if (!tenantId) {
            throw new CredentialUnavailableError("ClientAssertionCredential: tenantId is a required parameter.");
        }
        if (!clientId) {
            throw new CredentialUnavailableError("ClientAssertionCredential: clientId is a required parameter.");
        }
        if (!getAssertion) {
            throw new CredentialUnavailableError("ClientAssertionCredential: clientAssertion is a required parameter.");
        }
        this.tenantId = tenantId;
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.options = options;
        this.getAssertion = getAssertion;
        this.msalClient = createMsalClient(clientId, tenantId, Object.assign(Object.assign({}, options), { logger: logger$h, tokenCredentialOptions: this.options }));
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async (newOptions) => {
            newOptions.tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds, logger$h);
            const arrayScopes = Array.isArray(scopes) ? scopes : [scopes];
            return this.msalClient.getTokenByClientAssertion(arrayScopes, this.getAssertion, newOptions);
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const credentialName$4 = "WorkloadIdentityCredential";
/**
 * Contains the list of all supported environment variable names so that an
 * appropriate error message can be generated when no credentials can be
 * configured.
 *
 * @internal
 */
const SupportedWorkloadEnvironmentVariables = [
    "AZURE_TENANT_ID",
    "AZURE_CLIENT_ID",
    "AZURE_FEDERATED_TOKEN_FILE",
];
const logger$g = credentialLogger(credentialName$4);
/**
 * Workload Identity authentication is a feature in Azure that allows applications running on virtual machines (VMs)
 * to access other Azure resources without the need for a service principal or managed identity. With Workload Identity
 * authentication, applications authenticate themselves using their own identity, rather than using a shared service
 * principal or managed identity. Under the hood, Workload Identity authentication uses the concept of Service Account
 * Credentials (SACs), which are automatically created by Azure and stored securely in the VM. By using Workload
 * Identity authentication, you can avoid the need to manage and rotate service principals or managed identities for
 * each application on each VM. Additionally, because SACs are created automatically and managed by Azure, you don't
 * need to worry about storing and securing sensitive credentials themselves.
 * The WorkloadIdentityCredential supports Microsoft Entra Workload ID authentication on Azure Kubernetes and acquires
 * a token using the SACs available in the Azure Kubernetes environment.
 * Refer to <a href="https://learn.microsoft.com/azure/aks/workload-identity-overview">Microsoft Entra
 * Workload ID</a> for more information.
 */
class WorkloadIdentityCredential {
    /**
     * WorkloadIdentityCredential supports Microsoft Entra Workload ID on Kubernetes.
     *
     * @param options - The identity client options to use for authentication.
     */
    constructor(options) {
        this.azureFederatedTokenFileContent = undefined;
        this.cacheDate = undefined;
        // Logging environment variables for error details
        const assignedEnv = processEnvVars(SupportedWorkloadEnvironmentVariables).assigned.join(", ");
        logger$g.info(`Found the following environment variables: ${assignedEnv}`);
        const workloadIdentityCredentialOptions = options !== null && options !== void 0 ? options : {};
        const tenantId = workloadIdentityCredentialOptions.tenantId || process.env.AZURE_TENANT_ID;
        const clientId = workloadIdentityCredentialOptions.clientId || process.env.AZURE_CLIENT_ID;
        this.federatedTokenFilePath =
            workloadIdentityCredentialOptions.tokenFilePath || process.env.AZURE_FEDERATED_TOKEN_FILE;
        if (tenantId) {
            checkTenantId(logger$g, tenantId);
        }
        if (!clientId) {
            throw new CredentialUnavailableError(`${credentialName$4}: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
        See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot`);
        }
        if (!tenantId) {
            throw new CredentialUnavailableError(`${credentialName$4}: is unavailable. tenantId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_TENANT_ID".
        See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot`);
        }
        if (!this.federatedTokenFilePath) {
            throw new CredentialUnavailableError(`${credentialName$4}: is unavailable. federatedTokenFilePath is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_FEDERATED_TOKEN_FILE".
        See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot`);
        }
        logger$g.info(`Invoking ClientAssertionCredential with tenant ID: ${tenantId}, clientId: ${workloadIdentityCredentialOptions.clientId} and federated token path: [REDACTED]`);
        this.client = new ClientAssertionCredential(tenantId, clientId, this.readFileContents.bind(this), options);
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options) {
        if (!this.client) {
            const errorMessage = `${credentialName$4}: is unavailable. tenantId, clientId, and federatedTokenFilePath are required parameters. 
      In DefaultAzureCredential and ManagedIdentityCredential, these can be provided as environment variables - 
      "AZURE_TENANT_ID",
      "AZURE_CLIENT_ID",
      "AZURE_FEDERATED_TOKEN_FILE". See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot`;
            logger$g.info(errorMessage);
            throw new CredentialUnavailableError(errorMessage);
        }
        logger$g.info("Invoking getToken() of Client Assertion Credential");
        return this.client.getToken(scopes, options);
    }
    async readFileContents() {
        // Cached assertions expire after 5 minutes
        if (this.cacheDate !== undefined && Date.now() - this.cacheDate >= 1000 * 60 * 5) {
            this.azureFederatedTokenFileContent = undefined;
        }
        if (!this.federatedTokenFilePath) {
            throw new CredentialUnavailableError(`${credentialName$4}: is unavailable. Invalid file path provided ${this.federatedTokenFilePath}.`);
        }
        if (!this.azureFederatedTokenFileContent) {
            const file = await promises.readFile(this.federatedTokenFilePath, "utf8");
            const value = file.trim();
            if (!value) {
                throw new CredentialUnavailableError(`${credentialName$4}: is unavailable. No content on the file ${this.federatedTokenFilePath}.`);
            }
            else {
                this.azureFederatedTokenFileContent = value;
                this.cacheDate = Date.now();
            }
        }
        return this.azureFederatedTokenFileContent;
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const msiName = "ManagedIdentityCredential - Token Exchange";
const logger$f = credentialLogger(msiName);
/**
 * Defines how to determine whether the token exchange MSI is available, and also how to retrieve a token from the token exchange MSI.
 */
const tokenExchangeMsi = {
    name: "tokenExchangeMsi",
    async isAvailable({ clientId }) {
        const env = process.env;
        const result = Boolean((clientId || env.AZURE_CLIENT_ID) &&
            env.AZURE_TENANT_ID &&
            process.env.AZURE_FEDERATED_TOKEN_FILE);
        if (!result) {
            logger$f.info(`${msiName}: Unavailable. The environment variables needed are: AZURE_CLIENT_ID (or the client ID sent through the parameters), AZURE_TENANT_ID and AZURE_FEDERATED_TOKEN_FILE`);
        }
        return result;
    },
    async getToken(configuration, getTokenOptions = {}) {
        const { scopes, clientId } = configuration;
        const identityClientTokenCredentialOptions = {};
        const workloadIdentityCredential = new WorkloadIdentityCredential(Object.assign(Object.assign({ clientId, tenantId: process.env.AZURE_TENANT_ID, tokenFilePath: process.env.AZURE_FEDERATED_TOKEN_FILE }, identityClientTokenCredentialOptions), { disableInstanceDiscovery: true }));
        return workloadIdentityCredential.getToken(scopes, getTokenOptions);
    },
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$e = credentialLogger("ManagedIdentityCredential(MSAL)");
class MsalMsiProvider {
    constructor(clientIdOrOptions, options = {}) {
        var _a, _b;
        this.msiRetryConfig = {
            maxRetries: 5,
            startDelayInMs: 800,
            intervalIncrement: 2,
        };
        let _options = {};
        if (typeof clientIdOrOptions === "string") {
            this.clientId = clientIdOrOptions;
            _options = options;
        }
        else {
            this.clientId = clientIdOrOptions === null || clientIdOrOptions === void 0 ? void 0 : clientIdOrOptions.clientId;
            _options = clientIdOrOptions !== null && clientIdOrOptions !== void 0 ? clientIdOrOptions : {};
        }
        this.resourceId = _options === null || _options === void 0 ? void 0 : _options.resourceId;
        this.objectId = _options === null || _options === void 0 ? void 0 : _options.objectId;
        // For JavaScript users.
        const providedIds = [this.clientId, this.resourceId, this.objectId].filter(Boolean);
        if (providedIds.length > 1) {
            throw new Error(`ManagedIdentityCredential: only one of 'clientId', 'resourceId', or 'objectId' can be provided. Received values: ${JSON.stringify({ clientId: this.clientId, resourceId: this.resourceId, objectId: this.objectId })}`);
        }
        // ManagedIdentity uses http for local requests
        _options.allowInsecureConnection = true;
        if (((_a = _options === null || _options === void 0 ? void 0 : _options.retryOptions) === null || _a === void 0 ? void 0 : _a.maxRetries) !== undefined) {
            this.msiRetryConfig.maxRetries = _options.retryOptions.maxRetries;
        }
        this.identityClient = new IdentityClient(Object.assign(Object.assign({}, _options), { additionalPolicies: [{ policy: imdsRetryPolicy(this.msiRetryConfig), position: "perCall" }] }));
        this.managedIdentityApp = new msalCommon.ManagedIdentityApplication({
            managedIdentityIdParams: {
                userAssignedClientId: this.clientId,
                userAssignedResourceId: this.resourceId,
                userAssignedObjectId: this.objectId,
            },
            system: {
                // todo: proxyUrl?
                disableInternalRetries: true,
                networkClient: this.identityClient,
                loggerOptions: {
                    logLevel: getMSALLogLevel(logger$m.getLogLevel()),
                    piiLoggingEnabled: (_b = options.loggingOptions) === null || _b === void 0 ? void 0 : _b.enableUnsafeSupportLogging,
                    loggerCallback: defaultLoggerCallback(logger$e),
                },
            },
        });
        this.isAvailableIdentityClient = new IdentityClient(Object.assign(Object.assign({}, _options), { retryOptions: {
                maxRetries: 0,
            } }));
        // CloudShell MSI will ignore any user-assigned identity passed as parameters. To avoid confusion, we prevent this from happening as early as possible.
        if (this.managedIdentityApp.getManagedIdentitySource() === "CloudShell") {
            if (this.clientId || this.resourceId || this.objectId) {
                logger$e.warning(`CloudShell MSI detected with user-provided IDs - throwing. Received values: ${JSON.stringify({
                    clientId: this.clientId,
                    resourceId: this.resourceId,
                    objectId: this.objectId,
                })}.`);
                throw new CredentialUnavailableError("ManagedIdentityCredential: Specifying a user-assigned managed identity is not supported for CloudShell at runtime. When using Managed Identity in CloudShell, omit the clientId, resourceId, and objectId parameters.");
            }
        }
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     * If an unexpected error occurs, an {@link AuthenticationError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        logger$e.getToken.info("Using the MSAL provider for Managed Identity.");
        const resource = mapScopesToResource(scopes);
        if (!resource) {
            throw new CredentialUnavailableError(`ManagedIdentityCredential: Multiple scopes are not supported. Scopes: ${JSON.stringify(scopes)}`);
        }
        return tracingClient.withSpan("ManagedIdentityCredential.getToken", options, async () => {
            var _a;
            try {
                const isTokenExchangeMsi = await tokenExchangeMsi.isAvailable({
                    scopes,
                    clientId: this.clientId,
                    getTokenOptions: options,
                    identityClient: this.identityClient,
                    resourceId: this.resourceId,
                });
                // Most scenarios are handled by MSAL except for two:
                // AKS pod identity - MSAL does not implement the token exchange flow.
                // IMDS Endpoint probing - MSAL does not do any probing before trying to get a token.
                // As a DefaultAzureCredential optimization we probe the IMDS endpoint with a short timeout and no retries before actually trying to get a token
                // We will continue to implement these features in the Identity library.
                const identitySource = this.managedIdentityApp.getManagedIdentitySource();
                const isImdsMsi = identitySource === "DefaultToImds" || identitySource === "Imds"; // Neither actually checks that IMDS endpoint is available, just that it's the source the MSAL _would_ try to use.
                logger$e.getToken.info(`MSAL Identity source: ${identitySource}`);
                if (isTokenExchangeMsi) {
                    // In the AKS scenario we will use the existing tokenExchangeMsi indefinitely.
                    logger$e.getToken.info("Using the token exchange managed identity.");
                    const result = await tokenExchangeMsi.getToken({
                        scopes,
                        clientId: this.clientId,
                        identityClient: this.identityClient,
                        retryConfig: this.msiRetryConfig,
                        resourceId: this.resourceId,
                    });
                    if (result === null) {
                        throw new CredentialUnavailableError("Attempted to use the token exchange managed identity, but received a null response.");
                    }
                    return result;
                }
                else if (isImdsMsi) {
                    // In the IMDS scenario we will probe the IMDS endpoint to ensure it's available before trying to get a token.
                    // If the IMDS endpoint is not available and this is the source that MSAL will use, we will fail-fast with an error that tells DAC to move to the next credential.
                    logger$e.getToken.info("Using the IMDS endpoint to probe for availability.");
                    const isAvailable = await imdsMsi.isAvailable({
                        scopes,
                        clientId: this.clientId,
                        getTokenOptions: options,
                        identityClient: this.isAvailableIdentityClient,
                        resourceId: this.resourceId,
                    });
                    if (!isAvailable) {
                        throw new CredentialUnavailableError(`Attempted to use the IMDS endpoint, but it is not available.`);
                    }
                }
                // If we got this far, it means:
                // - This is not a tokenExchangeMsi,
                // - We already probed for IMDS endpoint availability and failed-fast if it's unreachable.
                // We can proceed normally by calling MSAL for a token.
                logger$e.getToken.info("Calling into MSAL for managed identity token.");
                const token = await this.managedIdentityApp.acquireToken({
                    resource,
                });
                this.ensureValidMsalToken(scopes, token, options);
                logger$e.getToken.info(formatSuccess(scopes));
                return {
                    expiresOnTimestamp: token.expiresOn.getTime(),
                    token: token.accessToken,
                    refreshAfterTimestamp: (_a = token.refreshOn) === null || _a === void 0 ? void 0 : _a.getTime(),
                    tokenType: "Bearer",
                };
            }
            catch (err) {
                logger$e.getToken.error(formatError(scopes, err));
                // AuthenticationRequiredError described as Error to enforce authentication after trying to retrieve a token silently.
                // TODO: why would this _ever_ happen considering we're not trying the silent request in this flow?
                if (err.name === "AuthenticationRequiredError") {
                    throw err;
                }
                if (isNetworkError(err)) {
                    throw new CredentialUnavailableError(`ManagedIdentityCredential: Network unreachable. Message: ${err.message}`, { cause: err });
                }
                throw new CredentialUnavailableError(`ManagedIdentityCredential: Authentication failed. Message ${err.message}`, { cause: err });
            }
        });
    }
    /**
     * Ensures the validity of the MSAL token
     */
    ensureValidMsalToken(scopes, msalToken, getTokenOptions) {
        const createError = (message) => {
            logger$e.getToken.info(message);
            return new AuthenticationRequiredError({
                scopes: Array.isArray(scopes) ? scopes : [scopes],
                getTokenOptions,
                message,
            });
        };
        if (!msalToken) {
            throw createError("No response.");
        }
        if (!msalToken.expiresOn) {
            throw createError(`Response had no "expiresOn" property.`);
        }
        if (!msalToken.accessToken) {
            throw createError(`Response had no "accessToken" property.`);
        }
    }
}
function isNetworkError(err) {
    // MSAL error
    if (err.errorCode === "network_error") {
        return true;
    }
    // Probe errors
    if (err.code === "ENETUNREACH" || err.code === "EHOSTUNREACH") {
        return true;
    }
    // This is a special case for Docker Desktop which responds with a 403 with a message that contains "A socket operation was attempted to an unreachable network" or "A socket operation was attempted to an unreachable host"
    // rather than just timing out, as expected.
    if (err.statusCode === 403 || err.code === 403) {
        if (err.message.includes("unreachable")) {
            return true;
        }
    }
    return false;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Attempts authentication using a managed identity available at the deployment environment.
 * This authentication type works in Azure VMs, App Service instances, Azure Functions applications,
 * Azure Kubernetes Services, Azure Service Fabric instances and inside of the Azure Cloud Shell.
 *
 * More information about configuring managed identities can be found here:
 * https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview
 */
class ManagedIdentityCredential {
    /**
     * @internal
     * @hidden
     */
    constructor(clientIdOrOptions, options) {
        // https://github.com/Azure/azure-sdk-for-js/issues/30189
        // If needed, you may release a hotfix to quickly rollback to the legacy implementation by changing the following line to:
        // this.implProvider = new LegacyMsiProvider(clientIdOrOptions, options);
        // Once stabilized, you can remove the legacy implementation and inline the msalMsiProvider code here as a drop-in replacement.
        this.implProvider = new MsalMsiProvider(clientIdOrOptions, options);
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     * If an unexpected error occurs, an {@link AuthenticationError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options) {
        return this.implProvider.getToken(scopes, options);
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Ensures the scopes value is an array.
 * @internal
 */
function ensureScopes(scopes) {
    return Array.isArray(scopes) ? scopes : [scopes];
}
/**
 * Throws if the received scope is not valid.
 * @internal
 */
function ensureValidScopeForDevTimeCreds(scope, logger) {
    if (!scope.match(/^[0-9a-zA-Z-_.:/]+$/)) {
        const error = new Error("Invalid scope was specified by the user or calling client");
        logger.getToken.info(formatError(scope, error));
        throw error;
    }
}
/**
 * Returns the resource out of a scope.
 * @internal
 */
function getScopeResource(scope) {
    return scope.replace(/\/.default$/, "");
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Mockable reference to the CLI credential cliCredentialFunctions
 * @internal
 */
const cliCredentialInternals = {
    /**
     * @internal
     */
    getSafeWorkingDir() {
        if (process.platform === "win32") {
            if (!process.env.SystemRoot) {
                throw new Error("Azure CLI credential expects a 'SystemRoot' environment variable");
            }
            return process.env.SystemRoot;
        }
        else {
            return "/bin";
        }
    },
    /**
     * Gets the access token from Azure CLI
     * @param resource - The resource to use when getting the token
     * @internal
     */
    async getAzureCliAccessToken(resource, tenantId, timeout) {
        let tenantSection = [];
        if (tenantId) {
            tenantSection = ["--tenant", tenantId];
        }
        return new Promise((resolve, reject) => {
            try {
                child_process.execFile("az", [
                    "account",
                    "get-access-token",
                    "--output",
                    "json",
                    "--resource",
                    resource,
                    ...tenantSection,
                ], { cwd: cliCredentialInternals.getSafeWorkingDir(), shell: true, timeout }, (error, stdout, stderr) => {
                    resolve({ stdout: stdout, stderr: stderr, error });
                });
            }
            catch (err) {
                reject(err);
            }
        });
    },
};
const logger$d = credentialLogger("AzureCliCredential");
/**
 * This credential will use the currently logged-in user login information
 * via the Azure CLI ('az') commandline tool.
 * To do so, it will read the user access token and expire time
 * with Azure CLI command "az account get-access-token".
 */
class AzureCliCredential {
    /**
     * Creates an instance of the {@link AzureCliCredential}.
     *
     * To use this credential, ensure that you have already logged
     * in via the 'az' tool using the command "az login" from the commandline.
     *
     * @param options - Options, to optionally allow multi-tenant requests.
     */
    constructor(options) {
        if (options === null || options === void 0 ? void 0 : options.tenantId) {
            checkTenantId(logger$d, options === null || options === void 0 ? void 0 : options.tenantId);
            this.tenantId = options === null || options === void 0 ? void 0 : options.tenantId;
        }
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.timeout = options === null || options === void 0 ? void 0 : options.processTimeoutInMs;
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        const tenantId = processMultiTenantRequest(this.tenantId, options, this.additionallyAllowedTenantIds);
        if (tenantId) {
            checkTenantId(logger$d, tenantId);
        }
        const scope = typeof scopes === "string" ? scopes : scopes[0];
        logger$d.getToken.info(`Using the scope ${scope}`);
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async () => {
            var _a, _b, _c, _d;
            try {
                ensureValidScopeForDevTimeCreds(scope, logger$d);
                const resource = getScopeResource(scope);
                const obj = await cliCredentialInternals.getAzureCliAccessToken(resource, tenantId, this.timeout);
                const specificScope = (_a = obj.stderr) === null || _a === void 0 ? void 0 : _a.match("(.*)az login --scope(.*)");
                const isLoginError = ((_b = obj.stderr) === null || _b === void 0 ? void 0 : _b.match("(.*)az login(.*)")) && !specificScope;
                const isNotInstallError = ((_c = obj.stderr) === null || _c === void 0 ? void 0 : _c.match("az:(.*)not found")) || ((_d = obj.stderr) === null || _d === void 0 ? void 0 : _d.startsWith("'az' is not recognized"));
                if (isNotInstallError) {
                    const error = new CredentialUnavailableError("Azure CLI could not be found. Please visit https://aka.ms/azure-cli for installation instructions and then, once installed, authenticate to your Azure account using 'az login'.");
                    logger$d.getToken.info(formatError(scopes, error));
                    throw error;
                }
                if (isLoginError) {
                    const error = new CredentialUnavailableError("Please run 'az login' from a command prompt to authenticate before using this credential.");
                    logger$d.getToken.info(formatError(scopes, error));
                    throw error;
                }
                try {
                    const responseData = obj.stdout;
                    const response = this.parseRawResponse(responseData);
                    logger$d.getToken.info(formatSuccess(scopes));
                    return response;
                }
                catch (e) {
                    if (obj.stderr) {
                        throw new CredentialUnavailableError(obj.stderr);
                    }
                    throw e;
                }
            }
            catch (err) {
                const error = err.name === "CredentialUnavailableError"
                    ? err
                    : new CredentialUnavailableError(err.message || "Unknown error while trying to retrieve the access token");
                logger$d.getToken.info(formatError(scopes, error));
                throw error;
            }
        });
    }
    /**
     * Parses the raw JSON response from the Azure CLI into a usable AccessToken object
     *
     * @param rawResponse - The raw JSON response from the Azure CLI
     * @returns An access token with the expiry time parsed from the raw response
     *
     * The expiryTime of the credential's access token, in milliseconds, is calculated as follows:
     *
     * When available, expires_on (introduced in Azure CLI v2.54.0) will be preferred. Otherwise falls back to expiresOn.
     */
    parseRawResponse(rawResponse) {
        const response = JSON.parse(rawResponse);
        const token = response.accessToken;
        // if available, expires_on will be a number representing seconds since epoch.
        // ensure it's a number or NaN
        let expiresOnTimestamp = Number.parseInt(response.expires_on, 10) * 1000;
        if (!isNaN(expiresOnTimestamp)) {
            logger$d.getToken.info("expires_on is available and is valid, using it");
            return {
                token,
                expiresOnTimestamp,
                tokenType: "Bearer",
            };
        }
        // fallback to the older expiresOn - an RFC3339 date string
        expiresOnTimestamp = new Date(response.expiresOn).getTime();
        // ensure expiresOn is well-formatted
        if (isNaN(expiresOnTimestamp)) {
            throw new CredentialUnavailableError(`Unexpected response from Azure CLI when getting token. Expected "expiresOn" to be a RFC3339 date string. Got: "${response.expiresOn}"`);
        }
        return {
            token,
            expiresOnTimestamp,
            tokenType: "Bearer",
        };
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Mockable reference to the Developer CLI credential cliCredentialFunctions
 * @internal
 */
const developerCliCredentialInternals = {
    /**
     * @internal
     */
    getSafeWorkingDir() {
        if (process.platform === "win32") {
            if (!process.env.SystemRoot) {
                throw new Error("Azure Developer CLI credential expects a 'SystemRoot' environment variable");
            }
            return process.env.SystemRoot;
        }
        else {
            return "/bin";
        }
    },
    /**
     * Gets the access token from Azure Developer CLI
     * @param scopes - The scopes to use when getting the token
     * @internal
     */
    async getAzdAccessToken(scopes, tenantId, timeout) {
        let tenantSection = [];
        if (tenantId) {
            tenantSection = ["--tenant-id", tenantId];
        }
        return new Promise((resolve, reject) => {
            try {
                child_process.execFile("azd", [
                    "auth",
                    "token",
                    "--output",
                    "json",
                    ...scopes.reduce((previous, current) => previous.concat("--scope", current), []),
                    ...tenantSection,
                ], {
                    cwd: developerCliCredentialInternals.getSafeWorkingDir(),
                    timeout,
                }, (error, stdout, stderr) => {
                    resolve({ stdout, stderr, error });
                });
            }
            catch (err) {
                reject(err);
            }
        });
    },
};
const logger$c = credentialLogger("AzureDeveloperCliCredential");
/**
 * Azure Developer CLI is a command-line interface tool that allows developers to create, manage, and deploy
 * resources in Azure. It's built on top of the Azure CLI and provides additional functionality specific
 * to Azure developers. It allows users to authenticate as a user and/or a service principal against
 * <a href="https://learn.microsoft.com/entra/fundamentals/">Microsoft Entra ID</a>. The
 * AzureDeveloperCliCredential authenticates in a development environment and acquires a token on behalf of
 * the logged-in user or service principal in the Azure Developer CLI. It acts as the Azure Developer CLI logged in user or
 * service principal and executes an Azure CLI command underneath to authenticate the application against
 * Microsoft Entra ID.
 *
 * <h2> Configure AzureDeveloperCliCredential </h2>
 *
 * To use this credential, the developer needs to authenticate locally in Azure Developer CLI using one of the
 * commands below:
 *
 * <ol>
 *     <li>Run "azd auth login" in Azure Developer CLI to authenticate interactively as a user.</li>
 *     <li>Run "azd auth login --client-id clientID --client-secret clientSecret
 *     --tenant-id tenantID" to authenticate as a service principal.</li>
 * </ol>
 *
 * You may need to repeat this process after a certain time period, depending on the refresh token validity in your
 * organization. Generally, the refresh token validity period is a few weeks to a few months.
 * AzureDeveloperCliCredential will prompt you to sign in again.
 */
class AzureDeveloperCliCredential {
    /**
     * Creates an instance of the {@link AzureDeveloperCliCredential}.
     *
     * To use this credential, ensure that you have already logged
     * in via the 'azd' tool using the command "azd auth login" from the commandline.
     *
     * @param options - Options, to optionally allow multi-tenant requests.
     */
    constructor(options) {
        if (options === null || options === void 0 ? void 0 : options.tenantId) {
            checkTenantId(logger$c, options === null || options === void 0 ? void 0 : options.tenantId);
            this.tenantId = options === null || options === void 0 ? void 0 : options.tenantId;
        }
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.timeout = options === null || options === void 0 ? void 0 : options.processTimeoutInMs;
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        const tenantId = processMultiTenantRequest(this.tenantId, options, this.additionallyAllowedTenantIds);
        if (tenantId) {
            checkTenantId(logger$c, tenantId);
        }
        let scopeList;
        if (typeof scopes === "string") {
            scopeList = [scopes];
        }
        else {
            scopeList = scopes;
        }
        logger$c.getToken.info(`Using the scopes ${scopes}`);
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async () => {
            var _a, _b, _c, _d;
            try {
                scopeList.forEach((scope) => {
                    ensureValidScopeForDevTimeCreds(scope, logger$c);
                });
                const obj = await developerCliCredentialInternals.getAzdAccessToken(scopeList, tenantId, this.timeout);
                const isNotLoggedInError = ((_a = obj.stderr) === null || _a === void 0 ? void 0 : _a.match("not logged in, run `azd login` to login")) ||
                    ((_b = obj.stderr) === null || _b === void 0 ? void 0 : _b.match("not logged in, run `azd auth login` to login"));
                const isNotInstallError = ((_c = obj.stderr) === null || _c === void 0 ? void 0 : _c.match("azd:(.*)not found")) ||
                    ((_d = obj.stderr) === null || _d === void 0 ? void 0 : _d.startsWith("'azd' is not recognized"));
                if (isNotInstallError || (obj.error && obj.error.code === "ENOENT")) {
                    const error = new CredentialUnavailableError("Azure Developer CLI couldn't be found. To mitigate this issue, see the troubleshooting guidelines at https://aka.ms/azsdk/js/identity/azdevclicredential/troubleshoot.");
                    logger$c.getToken.info(formatError(scopes, error));
                    throw error;
                }
                if (isNotLoggedInError) {
                    const error = new CredentialUnavailableError("Please run 'azd auth login' from a command prompt to authenticate before using this credential. For more information, see the troubleshooting guidelines at https://aka.ms/azsdk/js/identity/azdevclicredential/troubleshoot.");
                    logger$c.getToken.info(formatError(scopes, error));
                    throw error;
                }
                try {
                    const resp = JSON.parse(obj.stdout);
                    logger$c.getToken.info(formatSuccess(scopes));
                    return {
                        token: resp.token,
                        expiresOnTimestamp: new Date(resp.expiresOn).getTime(),
                        tokenType: "Bearer",
                    };
                }
                catch (e) {
                    if (obj.stderr) {
                        throw new CredentialUnavailableError(obj.stderr);
                    }
                    throw e;
                }
            }
            catch (err) {
                const error = err.name === "CredentialUnavailableError"
                    ? err
                    : new CredentialUnavailableError(err.message || "Unknown error while trying to retrieve the access token");
                logger$c.getToken.info(formatError(scopes, error));
                throw error;
            }
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Easy to mock childProcess utils.
 * @internal
 */
const processUtils = {
    /**
     * Promisifying childProcess.execFile
     * @internal
     */
    execFile(file, params, options) {
        return new Promise((resolve, reject) => {
            child_process__namespace.execFile(file, params, options, (error, stdout, stderr) => {
                if (Buffer.isBuffer(stdout)) {
                    stdout = stdout.toString("utf8");
                }
                if (Buffer.isBuffer(stderr)) {
                    stderr = stderr.toString("utf8");
                }
                if (stderr || error) {
                    reject(stderr ? new Error(stderr) : error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    },
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$b = credentialLogger("AzurePowerShellCredential");
const isWindows = process.platform === "win32";
/**
 * Returns a platform-appropriate command name by appending ".exe" on Windows.
 *
 * @internal
 */
function formatCommand(commandName) {
    if (isWindows) {
        return `${commandName}.exe`;
    }
    else {
        return commandName;
    }
}
/**
 * Receives a list of commands to run, executes them, then returns the outputs.
 * If anything fails, an error is thrown.
 * @internal
 */
async function runCommands(commands, timeout) {
    const results = [];
    for (const command of commands) {
        const [file, ...parameters] = command;
        const result = (await processUtils.execFile(file, parameters, {
            encoding: "utf8",
            timeout,
        }));
        results.push(result);
    }
    return results;
}
/**
 * Known PowerShell errors
 * @internal
 */
const powerShellErrors = {
    login: "Run Connect-AzAccount to login",
    installed: "The specified module 'Az.Accounts' with version '2.2.0' was not loaded because no valid module file was found in any module directory",
};
/**
 * Messages to use when throwing in this credential.
 * @internal
 */
const powerShellPublicErrorMessages = {
    login: "Please run 'Connect-AzAccount' from PowerShell to authenticate before using this credential.",
    installed: `The 'Az.Account' module >= 2.2.0 is not installed. Install the Azure Az PowerShell module with: "Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force".`,
    troubleshoot: `To troubleshoot, visit https://aka.ms/azsdk/js/identity/powershellcredential/troubleshoot.`,
};
// PowerShell Azure User not logged in error check.
const isLoginError = (err) => err.message.match(`(.*)${powerShellErrors.login}(.*)`);
// Az Module not Installed in Azure PowerShell check.
const isNotInstalledError = (err) => err.message.match(powerShellErrors.installed);
/**
 * The PowerShell commands to be tried, in order.
 *
 * @internal
 */
const commandStack = [formatCommand("pwsh")];
if (isWindows) {
    commandStack.push(formatCommand("powershell"));
}
/**
 * This credential will use the currently logged-in user information from the
 * Azure PowerShell module. To do so, it will read the user access token and
 * expire time with Azure PowerShell command `Get-AzAccessToken -ResourceUrl {ResourceScope}`
 */
class AzurePowerShellCredential {
    /**
     * Creates an instance of the {@link AzurePowerShellCredential}.
     *
     * To use this credential:
     * - Install the Azure Az PowerShell module with:
     *   `Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force`.
     * - You have already logged in to Azure PowerShell using the command
     * `Connect-AzAccount` from the command line.
     *
     * @param options - Options, to optionally allow multi-tenant requests.
     */
    constructor(options) {
        if (options === null || options === void 0 ? void 0 : options.tenantId) {
            checkTenantId(logger$b, options === null || options === void 0 ? void 0 : options.tenantId);
            this.tenantId = options === null || options === void 0 ? void 0 : options.tenantId;
        }
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.timeout = options === null || options === void 0 ? void 0 : options.processTimeoutInMs;
    }
    /**
     * Gets the access token from Azure PowerShell
     * @param resource - The resource to use when getting the token
     */
    async getAzurePowerShellAccessToken(resource, tenantId, timeout) {
        // Clone the stack to avoid mutating it while iterating
        for (const powerShellCommand of [...commandStack]) {
            try {
                await runCommands([[powerShellCommand, "/?"]], timeout);
            }
            catch (e) {
                // Remove this credential from the original stack so that we don't try it again.
                commandStack.shift();
                continue;
            }
            const results = await runCommands([
                [
                    powerShellCommand,
                    "-NoProfile",
                    "-NonInteractive",
                    "-Command",
                    `
          $tenantId = "${tenantId !== null && tenantId !== void 0 ? tenantId : ""}"
          $m = Import-Module Az.Accounts -MinimumVersion 2.2.0 -PassThru
          $useSecureString = $m.Version -ge [version]'2.17.0'

          $params = @{
            ResourceUrl = "${resource}"
          }

          if ($tenantId.Length -gt 0) {
            $params["TenantId"] = $tenantId
          }

          if ($useSecureString) {
            $params["AsSecureString"] = $true
          }

          $token = Get-AzAccessToken @params

          $result = New-Object -TypeName PSObject
          $result | Add-Member -MemberType NoteProperty -Name ExpiresOn -Value $token.ExpiresOn
          if ($useSecureString) {
            $result | Add-Member -MemberType NoteProperty -Name Token -Value (ConvertFrom-SecureString -AsPlainText $token.Token)
          } else {
            $result | Add-Member -MemberType NoteProperty -Name Token -Value $token.Token
          }

          Write-Output (ConvertTo-Json $result)
          `,
                ],
            ]);
            const result = results[0];
            return parseJsonToken(result);
        }
        throw new Error(`Unable to execute PowerShell. Ensure that it is installed in your system`);
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If the authentication cannot be performed through PowerShell, a {@link CredentialUnavailableError} will be thrown.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async () => {
            const tenantId = processMultiTenantRequest(this.tenantId, options, this.additionallyAllowedTenantIds);
            const scope = typeof scopes === "string" ? scopes : scopes[0];
            if (tenantId) {
                checkTenantId(logger$b, tenantId);
            }
            try {
                ensureValidScopeForDevTimeCreds(scope, logger$b);
                logger$b.getToken.info(`Using the scope ${scope}`);
                const resource = getScopeResource(scope);
                const response = await this.getAzurePowerShellAccessToken(resource, tenantId, this.timeout);
                logger$b.getToken.info(formatSuccess(scopes));
                return {
                    token: response.Token,
                    expiresOnTimestamp: new Date(response.ExpiresOn).getTime(),
                    tokenType: "Bearer",
                };
            }
            catch (err) {
                if (isNotInstalledError(err)) {
                    const error = new CredentialUnavailableError(powerShellPublicErrorMessages.installed);
                    logger$b.getToken.info(formatError(scope, error));
                    throw error;
                }
                else if (isLoginError(err)) {
                    const error = new CredentialUnavailableError(powerShellPublicErrorMessages.login);
                    logger$b.getToken.info(formatError(scope, error));
                    throw error;
                }
                const error = new CredentialUnavailableError(`${err}. ${powerShellPublicErrorMessages.troubleshoot}`);
                logger$b.getToken.info(formatError(scope, error));
                throw error;
            }
        });
    }
}
/**
 *
 * @internal
 */
async function parseJsonToken(result) {
    const jsonRegex = /{[^{}]*}/g;
    const matches = result.match(jsonRegex);
    let resultWithoutToken = result;
    if (matches) {
        try {
            for (const item of matches) {
                try {
                    const jsonContent = JSON.parse(item);
                    if (jsonContent === null || jsonContent === void 0 ? void 0 : jsonContent.Token) {
                        resultWithoutToken = resultWithoutToken.replace(item, "");
                        if (resultWithoutToken) {
                            logger$b.getToken.warning(resultWithoutToken);
                        }
                        return jsonContent;
                    }
                }
                catch (e) {
                    continue;
                }
            }
        }
        catch (e) {
            throw new Error(`Unable to parse the output of PowerShell. Received output: ${result}`);
        }
    }
    throw new Error(`No access token found in the output. Received output: ${result}`);
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * @internal
 */
const logger$a = credentialLogger("ChainedTokenCredential");
/**
 * Enables multiple `TokenCredential` implementations to be tried in order
 * until one of the getToken methods returns an access token.
 */
class ChainedTokenCredential {
    /**
     * Creates an instance of ChainedTokenCredential using the given credentials.
     *
     * @param sources - `TokenCredential` implementations to be tried in order.
     *
     * Example usage:
     * ```ts snippet:chained_token_credential_example
     * import { ClientSecretCredential, ChainedTokenCredential } from "@azure/identity";
     *
     * const tenantId = "<tenant-id>";
     * const clientId = "<client-id>";
     * const clientSecret = "<client-secret>";
     * const anotherClientId = "<another-client-id>";
     * const anotherSecret = "<another-client-secret>";
     * const firstCredential = new ClientSecretCredential(tenantId, clientId, clientSecret);
     * const secondCredential = new ClientSecretCredential(tenantId, anotherClientId, anotherSecret);
     * const credentialChain = new ChainedTokenCredential(firstCredential, secondCredential);
     * ```
     */
    constructor(...sources) {
        this._sources = [];
        this._sources = sources;
    }
    /**
     * Returns the first access token returned by one of the chained
     * `TokenCredential` implementations.  Throws an {@link AggregateAuthenticationError}
     * when one or more credentials throws an {@link AuthenticationError} and
     * no credentials have returned an access token.
     *
     * This method is called automatically by Azure SDK client libraries. You may call this method
     * directly, but you must also handle token caching and token refreshing.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                `TokenCredential` implementation might make.
     */
    async getToken(scopes, options = {}) {
        const { token } = await this.getTokenInternal(scopes, options);
        return token;
    }
    async getTokenInternal(scopes, options = {}) {
        let token = null;
        let successfulCredential;
        const errors = [];
        return tracingClient.withSpan("ChainedTokenCredential.getToken", options, async (updatedOptions) => {
            for (let i = 0; i < this._sources.length && token === null; i++) {
                try {
                    token = await this._sources[i].getToken(scopes, updatedOptions);
                    successfulCredential = this._sources[i];
                }
                catch (err) {
                    if (err.name === "CredentialUnavailableError" ||
                        err.name === "AuthenticationRequiredError") {
                        errors.push(err);
                    }
                    else {
                        logger$a.getToken.info(formatError(scopes, err));
                        throw err;
                    }
                }
            }
            if (!token && errors.length > 0) {
                const err = new AggregateAuthenticationError(errors, "ChainedTokenCredential authentication failed.");
                logger$a.getToken.info(formatError(scopes, err));
                throw err;
            }
            logger$a.getToken.info(`Result for ${successfulCredential.constructor.name}: ${formatSuccess(scopes)}`);
            if (token === null) {
                throw new CredentialUnavailableError("Failed to retrieve a valid token");
            }
            return { token, successfulCredential };
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const credentialName$3 = "ClientCertificateCredential";
const logger$9 = credentialLogger(credentialName$3);
/**
 * Enables authentication to Microsoft Entra ID using a PEM-encoded
 * certificate that is assigned to an App Registration. More information
 * on how to configure certificate authentication can be found here:
 *
 * https://learn.microsoft.com/en-us/azure/active-directory/develop/active-directory-certificate-credentials#register-your-certificate-with-azure-ad
 *
 */
class ClientCertificateCredential {
    constructor(tenantId, clientId, certificatePathOrConfiguration, options = {}) {
        if (!tenantId || !clientId) {
            throw new Error(`${credentialName$3}: tenantId and clientId are required parameters.`);
        }
        this.tenantId = tenantId;
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.sendCertificateChain = options.sendCertificateChain;
        this.certificateConfiguration = Object.assign({}, (typeof certificatePathOrConfiguration === "string"
            ? {
                certificatePath: certificatePathOrConfiguration,
            }
            : certificatePathOrConfiguration));
        const certificate = this.certificateConfiguration.certificate;
        const certificatePath = this.certificateConfiguration.certificatePath;
        if (!this.certificateConfiguration || !(certificate || certificatePath)) {
            throw new Error(`${credentialName$3}: Provide either a PEM certificate in string form, or the path to that certificate in the filesystem. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.`);
        }
        if (certificate && certificatePath) {
            throw new Error(`${credentialName$3}: To avoid unexpected behaviors, providing both the contents of a PEM certificate and the path to a PEM certificate is forbidden. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.`);
        }
        this.msalClient = createMsalClient(clientId, tenantId, Object.assign(Object.assign({}, options), { logger: logger$9, tokenCredentialOptions: options }));
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${credentialName$3}.getToken`, options, async (newOptions) => {
            newOptions.tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds, logger$9);
            const arrayScopes = Array.isArray(scopes) ? scopes : [scopes];
            const certificate = await this.buildClientCertificate();
            return this.msalClient.getTokenByClientCertificate(arrayScopes, certificate, newOptions);
        });
    }
    async buildClientCertificate() {
        var _a;
        const parts = await parseCertificate(this.certificateConfiguration, (_a = this.sendCertificateChain) !== null && _a !== void 0 ? _a : false);
        let privateKey;
        if (this.certificateConfiguration.certificatePassword !== undefined) {
            privateKey = crypto.createPrivateKey({
                key: parts.certificateContents,
                passphrase: this.certificateConfiguration.certificatePassword,
                format: "pem",
            })
                .export({
                format: "pem",
                type: "pkcs8",
            })
                .toString();
        }
        else {
            privateKey = parts.certificateContents;
        }
        return {
            thumbprint: parts.thumbprint,
            privateKey,
            x5c: parts.x5c,
        };
    }
}
/**
 * Parses a certificate into its relevant parts
 *
 * @param certificateConfiguration - The certificate contents or path to the certificate
 * @param sendCertificateChain - true if the entire certificate chain should be sent for SNI, false otherwise
 * @returns The parsed certificate parts and the certificate contents
 */
async function parseCertificate(certificateConfiguration, sendCertificateChain) {
    const certificate = certificateConfiguration.certificate;
    const certificatePath = certificateConfiguration.certificatePath;
    const certificateContents = certificate || (await promises.readFile(certificatePath, "utf8"));
    const x5c = sendCertificateChain ? certificateContents : undefined;
    const certificatePattern = /(-+BEGIN CERTIFICATE-+)(\n\r?|\r\n?)([A-Za-z0-9+/\n\r]+=*)(\n\r?|\r\n?)(-+END CERTIFICATE-+)/g;
    const publicKeys = [];
    // Match all possible certificates, in the order they are in the file. These will form the chain that is used for x5c
    let match;
    do {
        match = certificatePattern.exec(certificateContents);
        if (match) {
            publicKeys.push(match[3]);
        }
    } while (match);
    if (publicKeys.length === 0) {
        throw new Error("The file at the specified path does not contain a PEM-encoded certificate.");
    }
    const thumbprint = crypto.createHash("sha1")
        .update(Buffer.from(publicKeys[0], "base64"))
        .digest("hex")
        .toUpperCase();
    return {
        certificateContents,
        thumbprint,
        x5c,
    };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$8 = credentialLogger("ClientSecretCredential");
/**
 * Enables authentication to Microsoft Entra ID using a client secret
 * that was generated for an App Registration. More information on how
 * to configure a client secret can be found here:
 *
 * https://learn.microsoft.com/entra/identity-platform/quickstart-configure-app-access-web-apis#add-credentials-to-your-web-application
 *
 */
class ClientSecretCredential {
    /**
     * Creates an instance of the ClientSecretCredential with the details
     * needed to authenticate against Microsoft Entra ID with a client
     * secret.
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param clientSecret - A client secret that was generated for the App Registration.
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId, clientId, clientSecret, options = {}) {
        if (!tenantId) {
            throw new CredentialUnavailableError("ClientSecretCredential: tenantId is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.");
        }
        if (!clientId) {
            throw new CredentialUnavailableError("ClientSecretCredential: clientId is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.");
        }
        if (!clientSecret) {
            throw new CredentialUnavailableError("ClientSecretCredential: clientSecret is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.");
        }
        this.clientSecret = clientSecret;
        this.tenantId = tenantId;
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.msalClient = createMsalClient(clientId, tenantId, Object.assign(Object.assign({}, options), { logger: logger$8, tokenCredentialOptions: options }));
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async (newOptions) => {
            newOptions.tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds, logger$8);
            const arrayScopes = ensureScopes(scopes);
            return this.msalClient.getTokenByClientSecret(arrayScopes, this.clientSecret, newOptions);
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$7 = credentialLogger("UsernamePasswordCredential");
/**
 * Enables authentication to Microsoft Entra ID with a user's
 * username and password. This credential requires a high degree of
 * trust so you should only use it when other, more secure credential
 * types can't be used.
 */
class UsernamePasswordCredential {
    /**
     * Creates an instance of the UsernamePasswordCredential with the details
     * needed to authenticate against Microsoft Entra ID with a username
     * and password.
     *
     * @param tenantId - The Microsoft Entra tenant (directory).
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param username - The user account's e-mail address (user name).
     * @param password - The user account's account password
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId, clientId, username, password, options = {}) {
        if (!tenantId) {
            throw new CredentialUnavailableError("UsernamePasswordCredential: tenantId is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/usernamepasswordcredential/troubleshoot.");
        }
        if (!clientId) {
            throw new CredentialUnavailableError("UsernamePasswordCredential: clientId is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/usernamepasswordcredential/troubleshoot.");
        }
        if (!username) {
            throw new CredentialUnavailableError("UsernamePasswordCredential: username is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/usernamepasswordcredential/troubleshoot.");
        }
        if (!password) {
            throw new CredentialUnavailableError("UsernamePasswordCredential: password is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/usernamepasswordcredential/troubleshoot.");
        }
        this.tenantId = tenantId;
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.username = username;
        this.password = password;
        this.msalClient = createMsalClient(clientId, this.tenantId, Object.assign(Object.assign({}, options), { tokenCredentialOptions: options !== null && options !== void 0 ? options : {} }));
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the user provided the option `disableAutomaticAuthentication`,
     * once the token can't be retrieved silently,
     * this method won't attempt to request user interaction to retrieve the token.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async (newOptions) => {
            newOptions.tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds, logger$7);
            const arrayScopes = ensureScopes(scopes);
            return this.msalClient.getTokenByUsernamePassword(arrayScopes, this.username, this.password, newOptions);
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Contains the list of all supported environment variable names so that an
 * appropriate error message can be generated when no credentials can be
 * configured.
 *
 * @internal
 */
const AllSupportedEnvironmentVariables = [
    "AZURE_TENANT_ID",
    "AZURE_CLIENT_ID",
    "AZURE_CLIENT_SECRET",
    "AZURE_CLIENT_CERTIFICATE_PATH",
    "AZURE_CLIENT_CERTIFICATE_PASSWORD",
    "AZURE_USERNAME",
    "AZURE_PASSWORD",
    "AZURE_ADDITIONALLY_ALLOWED_TENANTS",
    "AZURE_CLIENT_SEND_CERTIFICATE_CHAIN",
];
function getAdditionallyAllowedTenants() {
    var _a;
    const additionallyAllowedValues = (_a = process.env.AZURE_ADDITIONALLY_ALLOWED_TENANTS) !== null && _a !== void 0 ? _a : "";
    return additionallyAllowedValues.split(";");
}
const credentialName$2 = "EnvironmentCredential";
const logger$6 = credentialLogger(credentialName$2);
function getSendCertificateChain() {
    var _a;
    const sendCertificateChain = ((_a = process.env.AZURE_CLIENT_SEND_CERTIFICATE_CHAIN) !== null && _a !== void 0 ? _a : "").toLowerCase();
    const result = sendCertificateChain === "true" || sendCertificateChain === "1";
    logger$6.verbose(`AZURE_CLIENT_SEND_CERTIFICATE_CHAIN: ${process.env.AZURE_CLIENT_SEND_CERTIFICATE_CHAIN}; sendCertificateChain: ${result}`);
    return result;
}
/**
 * Enables authentication to Microsoft Entra ID using a client secret or certificate, or as a user
 * with a username and password.
 */
class EnvironmentCredential {
    /**
     * Creates an instance of the EnvironmentCredential class and decides what credential to use depending on the available environment variables.
     *
     * Required environment variables:
     * - `AZURE_TENANT_ID`: The Microsoft Entra tenant (directory) ID.
     * - `AZURE_CLIENT_ID`: The client (application) ID of an App Registration in the tenant.
     *
     * If setting the AZURE_TENANT_ID, then you can also set the additionally allowed tenants
     * - `AZURE_ADDITIONALLY_ALLOWED_TENANTS`: For multi-tenant applications, specifies additional tenants for which the credential may acquire tokens with a single semicolon delimited string. Use * to allow all tenants.
     *
     * Environment variables used for client credential authentication:
     * - `AZURE_CLIENT_SECRET`: A client secret that was generated for the App Registration.
     * - `AZURE_CLIENT_CERTIFICATE_PATH`: The path to a PEM certificate to use during the authentication, instead of the client secret.
     * - `AZURE_CLIENT_CERTIFICATE_PASSWORD`: (optional) password for the certificate file.
     * - `AZURE_CLIENT_SEND_CERTIFICATE_CHAIN`: (optional) indicates that the certificate chain should be set in x5c header to support subject name / issuer based authentication.
     *
     * Alternatively, users can provide environment variables for username and password authentication:
     * - `AZURE_USERNAME`: Username to authenticate with.
     * - `AZURE_PASSWORD`: Password to authenticate with.
     *
     * If the environment variables required to perform the authentication are missing, a {@link CredentialUnavailableError} will be thrown.
     * If the authentication fails, or if there's an unknown error, an {@link AuthenticationError} will be thrown.
     *
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(options) {
        // Keep track of any missing environment variables for error details
        this._credential = undefined;
        const assigned = processEnvVars(AllSupportedEnvironmentVariables).assigned.join(", ");
        logger$6.info(`Found the following environment variables: ${assigned}`);
        const tenantId = process.env.AZURE_TENANT_ID, clientId = process.env.AZURE_CLIENT_ID, clientSecret = process.env.AZURE_CLIENT_SECRET;
        const additionallyAllowedTenantIds = getAdditionallyAllowedTenants();
        const sendCertificateChain = getSendCertificateChain();
        const newOptions = Object.assign(Object.assign({}, options), { additionallyAllowedTenantIds, sendCertificateChain });
        if (tenantId) {
            checkTenantId(logger$6, tenantId);
        }
        if (tenantId && clientId && clientSecret) {
            logger$6.info(`Invoking ClientSecretCredential with tenant ID: ${tenantId}, clientId: ${clientId} and clientSecret: [REDACTED]`);
            this._credential = new ClientSecretCredential(tenantId, clientId, clientSecret, newOptions);
            return;
        }
        const certificatePath = process.env.AZURE_CLIENT_CERTIFICATE_PATH;
        const certificatePassword = process.env.AZURE_CLIENT_CERTIFICATE_PASSWORD;
        if (tenantId && clientId && certificatePath) {
            logger$6.info(`Invoking ClientCertificateCredential with tenant ID: ${tenantId}, clientId: ${clientId} and certificatePath: ${certificatePath}`);
            this._credential = new ClientCertificateCredential(tenantId, clientId, { certificatePath, certificatePassword }, newOptions);
            return;
        }
        const username = process.env.AZURE_USERNAME;
        const password = process.env.AZURE_PASSWORD;
        if (tenantId && clientId && username && password) {
            logger$6.info(`Invoking UsernamePasswordCredential with tenant ID: ${tenantId}, clientId: ${clientId} and username: ${username}`);
            this._credential = new UsernamePasswordCredential(tenantId, clientId, username, password, newOptions);
        }
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - Optional parameters. See {@link GetTokenOptions}.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${credentialName$2}.getToken`, options, async (newOptions) => {
            if (this._credential) {
                try {
                    const result = await this._credential.getToken(scopes, newOptions);
                    logger$6.getToken.info(formatSuccess(scopes));
                    return result;
                }
                catch (err) {
                    const authenticationError = new AuthenticationError(400, {
                        error: `${credentialName$2} authentication failed. To troubleshoot, visit https://aka.ms/azsdk/js/identity/environmentcredential/troubleshoot.`,
                        error_description: err.message.toString().split("More details:").join(""),
                    });
                    logger$6.getToken.info(formatError(scopes, authenticationError));
                    throw authenticationError;
                }
            }
            throw new CredentialUnavailableError(`${credentialName$2} is unavailable. No underlying credential could be used. To troubleshoot, visit https://aka.ms/azsdk/js/identity/environmentcredential/troubleshoot.`);
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$5 = credentialLogger("DefaultAzureCredential");
/**
 * Creates a {@link ManagedIdentityCredential} from the provided options.
 * @param options - Options to configure the credential.
 *
 * @internal
 */
function createDefaultManagedIdentityCredential(options = {}) {
    var _a, _b, _c, _d;
    (_a = options.retryOptions) !== null && _a !== void 0 ? _a : (options.retryOptions = {
        maxRetries: 5,
        retryDelayInMs: 800,
    });
    const managedIdentityClientId = (_b = options === null || options === void 0 ? void 0 : options.managedIdentityClientId) !== null && _b !== void 0 ? _b : process.env.AZURE_CLIENT_ID;
    const workloadIdentityClientId = (_c = options === null || options === void 0 ? void 0 : options.workloadIdentityClientId) !== null && _c !== void 0 ? _c : managedIdentityClientId;
    const managedResourceId = options === null || options === void 0 ? void 0 : options.managedIdentityResourceId;
    const workloadFile = process.env.AZURE_FEDERATED_TOKEN_FILE;
    const tenantId = (_d = options === null || options === void 0 ? void 0 : options.tenantId) !== null && _d !== void 0 ? _d : process.env.AZURE_TENANT_ID;
    if (managedResourceId) {
        const managedIdentityResourceIdOptions = Object.assign(Object.assign({}, options), { resourceId: managedResourceId });
        return new ManagedIdentityCredential(managedIdentityResourceIdOptions);
    }
    if (workloadFile && workloadIdentityClientId) {
        const workloadIdentityCredentialOptions = Object.assign(Object.assign({}, options), { tenantId: tenantId });
        return new ManagedIdentityCredential(workloadIdentityClientId, workloadIdentityCredentialOptions);
    }
    if (managedIdentityClientId) {
        const managedIdentityClientOptions = Object.assign(Object.assign({}, options), { clientId: managedIdentityClientId });
        return new ManagedIdentityCredential(managedIdentityClientOptions);
    }
    // We may be able to return a UnavailableCredential here, but that may be a breaking change
    return new ManagedIdentityCredential(options);
}
/**
 * Creates a {@link WorkloadIdentityCredential} from the provided options.
 * @param options - Options to configure the credential.
 *
 * @internal
 */
function createDefaultWorkloadIdentityCredential(options) {
    var _a, _b, _c;
    const managedIdentityClientId = (_a = options === null || options === void 0 ? void 0 : options.managedIdentityClientId) !== null && _a !== void 0 ? _a : process.env.AZURE_CLIENT_ID;
    const workloadIdentityClientId = (_b = options === null || options === void 0 ? void 0 : options.workloadIdentityClientId) !== null && _b !== void 0 ? _b : managedIdentityClientId;
    const workloadFile = process.env.AZURE_FEDERATED_TOKEN_FILE;
    const tenantId = (_c = options === null || options === void 0 ? void 0 : options.tenantId) !== null && _c !== void 0 ? _c : process.env.AZURE_TENANT_ID;
    if (workloadFile && workloadIdentityClientId) {
        const workloadIdentityCredentialOptions = Object.assign(Object.assign({}, options), { tenantId, clientId: workloadIdentityClientId, tokenFilePath: workloadFile });
        return new WorkloadIdentityCredential(workloadIdentityCredentialOptions);
    }
    if (tenantId) {
        const workloadIdentityClientTenantOptions = Object.assign(Object.assign({}, options), { tenantId });
        return new WorkloadIdentityCredential(workloadIdentityClientTenantOptions);
    }
    // We may be able to return a UnavailableCredential here, but that may be a breaking change
    return new WorkloadIdentityCredential(options);
}
/**
 * Creates a {@link AzureDeveloperCliCredential} from the provided options.
 * @param options - Options to configure the credential.
 *
 * @internal
 */
function createDefaultAzureDeveloperCliCredential(options = {}) {
    const processTimeoutInMs = options.processTimeoutInMs;
    return new AzureDeveloperCliCredential(Object.assign({ processTimeoutInMs }, options));
}
/**
 * Creates a {@link AzureCliCredential} from the provided options.
 * @param options - Options to configure the credential.
 *
 * @internal
 */
function createDefaultAzureCliCredential(options = {}) {
    const processTimeoutInMs = options.processTimeoutInMs;
    return new AzureCliCredential(Object.assign({ processTimeoutInMs }, options));
}
/**
 * Creates a {@link AzurePowerShellCredential} from the provided options.
 * @param options - Options to configure the credential.
 *
 * @internal
 */
function createDefaultAzurePowershellCredential(options = {}) {
    const processTimeoutInMs = options.processTimeoutInMs;
    return new AzurePowerShellCredential(Object.assign({ processTimeoutInMs }, options));
}
/**
 * Creates an {@link EnvironmentCredential} from the provided options.
 * @param options - Options to configure the credential.
 *
 * @internal
 */
function createEnvironmentCredential(options = {}) {
    return new EnvironmentCredential(options);
}
/**
 * A no-op credential that logs the reason it was skipped if getToken is called.
 * @internal
 */
class UnavailableDefaultCredential {
    constructor(credentialName, message) {
        this.credentialName = credentialName;
        this.credentialUnavailableErrorMessage = message;
    }
    getToken() {
        logger$5.getToken.info(`Skipping ${this.credentialName}, reason: ${this.credentialUnavailableErrorMessage}`);
        return Promise.resolve(null);
    }
}
/**
 * Provides a default {@link ChainedTokenCredential} configuration that should
 * work for most applications that use the Azure SDK.
 */
class DefaultAzureCredential extends ChainedTokenCredential {
    constructor(options) {
        const credentialFunctions = [
            createEnvironmentCredential,
            createDefaultWorkloadIdentityCredential,
            createDefaultManagedIdentityCredential,
            createDefaultAzureCliCredential,
            createDefaultAzurePowershellCredential,
            createDefaultAzureDeveloperCliCredential,
        ];
        // DefaultCredential constructors should not throw, instead throwing on getToken() which is handled by ChainedTokenCredential.
        // When adding new credentials to the default chain, consider:
        // 1. Making the constructor parameters required and explicit
        // 2. Validating any required parameters in the factory function
        // 3. Returning a UnavailableDefaultCredential from the factory function if a credential is unavailable for any reason
        const credentials = credentialFunctions.map((createCredentialFn) => {
            try {
                return createCredentialFn(options);
            }
            catch (err) {
                logger$5.warning(`Skipped ${createCredentialFn.name} because of an error creating the credential: ${err}`);
                return new UnavailableDefaultCredential(createCredentialFn.name, err.message);
            }
        });
        super(...credentials);
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$4 = credentialLogger("InteractiveBrowserCredential");
/**
 * Enables authentication to Microsoft Entra ID inside of the web browser
 * using the interactive login flow.
 */
class InteractiveBrowserCredential {
    /**
     * Creates an instance of InteractiveBrowserCredential with the details needed.
     *
     * This credential uses the [Authorization Code Flow](https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow).
     * On Node.js, it will open a browser window while it listens for a redirect response from the authentication service.
     * On browsers, it authenticates via popups. The `loginStyle` optional parameter can be set to `redirect` to authenticate by redirecting the user to an Azure secure login page, which then will redirect the user back to the web application where the authentication started.
     *
     * For Node.js, if a `clientId` is provided, the Microsoft Entra application will need to be configured to have a "Mobile and desktop applications" redirect endpoint.
     * Follow our guide on [setting up Redirect URIs for Desktop apps that calls to web APIs](https://learn.microsoft.com/entra/identity-platform/scenario-desktop-app-registration#redirect-uris).
     *
     * @param options - Options for configuring the client which makes the authentication requests.
     */
    constructor(options) {
        var _a, _b, _c, _d, _e;
        this.tenantId = resolveTenantId(logger$4, options.tenantId, options.clientId);
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        const msalClientOptions = Object.assign(Object.assign({}, options), { tokenCredentialOptions: options, logger: logger$4 });
        const ibcNodeOptions = options;
        this.browserCustomizationOptions = ibcNodeOptions.browserCustomizationOptions;
        this.loginHint = ibcNodeOptions.loginHint;
        if ((_a = ibcNodeOptions === null || ibcNodeOptions === void 0 ? void 0 : ibcNodeOptions.brokerOptions) === null || _a === void 0 ? void 0 : _a.enabled) {
            if (!((_b = ibcNodeOptions === null || ibcNodeOptions === void 0 ? void 0 : ibcNodeOptions.brokerOptions) === null || _b === void 0 ? void 0 : _b.parentWindowHandle)) {
                throw new Error("In order to do WAM authentication, `parentWindowHandle` under `brokerOptions` is a required parameter");
            }
            else {
                msalClientOptions.brokerOptions = {
                    enabled: true,
                    parentWindowHandle: ibcNodeOptions.brokerOptions.parentWindowHandle,
                    legacyEnableMsaPassthrough: (_c = ibcNodeOptions.brokerOptions) === null || _c === void 0 ? void 0 : _c.legacyEnableMsaPassthrough,
                    useDefaultBrokerAccount: (_d = ibcNodeOptions.brokerOptions) === null || _d === void 0 ? void 0 : _d.useDefaultBrokerAccount,
                };
            }
        }
        this.msalClient = createMsalClient((_e = options.clientId) !== null && _e !== void 0 ? _e : DeveloperSignOnClientId, this.tenantId, msalClientOptions);
        this.disableAutomaticAuthentication = options === null || options === void 0 ? void 0 : options.disableAutomaticAuthentication;
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the user provided the option `disableAutomaticAuthentication`,
     * once the token can't be retrieved silently,
     * this method won't attempt to request user interaction to retrieve the token.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async (newOptions) => {
            newOptions.tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds, logger$4);
            const arrayScopes = ensureScopes(scopes);
            return this.msalClient.getTokenByInteractiveRequest(arrayScopes, Object.assign(Object.assign({}, newOptions), { disableAutomaticAuthentication: this.disableAutomaticAuthentication, browserCustomizationOptions: this.browserCustomizationOptions, loginHint: this.loginHint }));
        });
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the token can't be retrieved silently, this method will always generate a challenge for the user.
     *
     * On Node.js, this credential has [Proof Key for Code Exchange (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636) enabled by default.
     * PKCE is a security feature that mitigates authentication code interception attacks.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                  TokenCredential implementation might make.
     */
    async authenticate(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.authenticate`, options, async (newOptions) => {
            const arrayScopes = ensureScopes(scopes);
            await this.msalClient.getTokenByInteractiveRequest(arrayScopes, Object.assign(Object.assign({}, newOptions), { disableAutomaticAuthentication: false, browserCustomizationOptions: this.browserCustomizationOptions, loginHint: this.loginHint }));
            return this.msalClient.getActiveAccount();
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$3 = credentialLogger("DeviceCodeCredential");
/**
 * Method that logs the user code from the DeviceCodeCredential.
 * @param deviceCodeInfo - The device code.
 */
function defaultDeviceCodePromptCallback(deviceCodeInfo) {
    console.log(deviceCodeInfo.message);
}
/**
 * Enables authentication to Microsoft Entra ID using a device code
 * that the user can enter into https://microsoft.com/devicelogin.
 */
class DeviceCodeCredential {
    /**
     * Creates an instance of DeviceCodeCredential with the details needed
     * to initiate the device code authorization flow with Microsoft Entra ID.
     *
     * A message will be logged, giving users a code that they can use to authenticate once they go to https://microsoft.com/devicelogin
     *
     * Developers can configure how this message is shown by passing a custom `userPromptCallback`:
     *
     * ```ts snippet:device_code_credential_example
     * import { DeviceCodeCredential } from "@azure/identity";
     *
     * const credential = new DeviceCodeCredential({
     *   tenantId: process.env.AZURE_TENANT_ID,
     *   clientId: process.env.AZURE_CLIENT_ID,
     *   userPromptCallback: (info) => {
     *     console.log("CUSTOMIZED PROMPT CALLBACK", info.message);
     *   },
     * });
     * ```
     *
     * @param options - Options for configuring the client which makes the authentication requests.
     */
    constructor(options) {
        var _a, _b;
        this.tenantId = options === null || options === void 0 ? void 0 : options.tenantId;
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        const clientId = (_a = options === null || options === void 0 ? void 0 : options.clientId) !== null && _a !== void 0 ? _a : DeveloperSignOnClientId;
        const tenantId = resolveTenantId(logger$3, options === null || options === void 0 ? void 0 : options.tenantId, clientId);
        this.userPromptCallback = (_b = options === null || options === void 0 ? void 0 : options.userPromptCallback) !== null && _b !== void 0 ? _b : defaultDeviceCodePromptCallback;
        this.msalClient = createMsalClient(clientId, tenantId, Object.assign(Object.assign({}, options), { logger: logger$3, tokenCredentialOptions: options || {} }));
        this.disableAutomaticAuthentication = options === null || options === void 0 ? void 0 : options.disableAutomaticAuthentication;
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the user provided the option `disableAutomaticAuthentication`,
     * once the token can't be retrieved silently,
     * this method won't attempt to request user interaction to retrieve the token.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async (newOptions) => {
            newOptions.tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds, logger$3);
            const arrayScopes = ensureScopes(scopes);
            return this.msalClient.getTokenByDeviceCode(arrayScopes, this.userPromptCallback, Object.assign(Object.assign({}, newOptions), { disableAutomaticAuthentication: this.disableAutomaticAuthentication }));
        });
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the token can't be retrieved silently, this method will always generate a challenge for the user.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                  TokenCredential implementation might make.
     */
    async authenticate(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.authenticate`, options, async (newOptions) => {
            const arrayScopes = Array.isArray(scopes) ? scopes : [scopes];
            await this.msalClient.getTokenByDeviceCode(arrayScopes, this.userPromptCallback, Object.assign(Object.assign({}, newOptions), { disableAutomaticAuthentication: false }));
            return this.msalClient.getActiveAccount();
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const credentialName$1 = "AzurePipelinesCredential";
const logger$2 = credentialLogger(credentialName$1);
const OIDC_API_VERSION = "7.1";
/**
 * This credential is designed to be used in Azure Pipelines with service connections
 * as a setup for workload identity federation.
 */
class AzurePipelinesCredential {
    /**
     * AzurePipelinesCredential supports Federated Identity on Azure Pipelines through Service Connections.
     * @param tenantId - tenantId associated with the service connection
     * @param clientId - clientId associated with the service connection
     * @param serviceConnectionId - Unique ID for the service connection, as found in the querystring's resourceId key
     * @param systemAccessToken - The pipeline's <see href="https://learn.microsoft.com/azure/devops/pipelines/build/variables?view=azure-devops%26tabs=yaml#systemaccesstoken">System.AccessToken</see> value.
     * @param options - The identity client options to use for authentication.
     */
    constructor(tenantId, clientId, serviceConnectionId, systemAccessToken, options = {}) {
        var _a, _b;
        if (!clientId) {
            throw new CredentialUnavailableError(`${credentialName$1}: is unavailable. clientId is a required parameter.`);
        }
        if (!tenantId) {
            throw new CredentialUnavailableError(`${credentialName$1}: is unavailable. tenantId is a required parameter.`);
        }
        if (!serviceConnectionId) {
            throw new CredentialUnavailableError(`${credentialName$1}: is unavailable. serviceConnectionId is a required parameter.`);
        }
        if (!systemAccessToken) {
            throw new CredentialUnavailableError(`${credentialName$1}: is unavailable. systemAccessToken is a required parameter.`);
        }
        // Allow these headers to be logged for troubleshooting by AzurePipelines.
        options.loggingOptions = Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.loggingOptions), { additionalAllowedHeaderNames: [
                ...((_b = (_a = options.loggingOptions) === null || _a === void 0 ? void 0 : _a.additionalAllowedHeaderNames) !== null && _b !== void 0 ? _b : []),
                "x-vss-e2eid",
                "x-msedge-ref",
            ] });
        this.identityClient = new IdentityClient(options);
        checkTenantId(logger$2, tenantId);
        logger$2.info(`Invoking AzurePipelinesCredential with tenant ID: ${tenantId}, client ID: ${clientId}, and service connection ID: ${serviceConnectionId}`);
        if (!process.env.SYSTEM_OIDCREQUESTURI) {
            throw new CredentialUnavailableError(`${credentialName$1}: is unavailable. Ensure that you're running this task in an Azure Pipeline, so that following missing system variable(s) can be defined- "SYSTEM_OIDCREQUESTURI"`);
        }
        const oidcRequestUrl = `${process.env.SYSTEM_OIDCREQUESTURI}?api-version=${OIDC_API_VERSION}&serviceConnectionId=${serviceConnectionId}`;
        logger$2.info(`Invoking ClientAssertionCredential with tenant ID: ${tenantId}, client ID: ${clientId} and service connection ID: ${serviceConnectionId}`);
        this.clientAssertionCredential = new ClientAssertionCredential(tenantId, clientId, this.requestOidcToken.bind(this, oidcRequestUrl, systemAccessToken), options);
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} or {@link AuthenticationError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options) {
        if (!this.clientAssertionCredential) {
            const errorMessage = `${credentialName$1}: is unavailable. To use Federation Identity in Azure Pipelines, the following parameters are required - 
      tenantId,
      clientId,
      serviceConnectionId,
      systemAccessToken,
      "SYSTEM_OIDCREQUESTURI".      
      See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/azurepipelinescredential/troubleshoot`;
            logger$2.error(errorMessage);
            throw new CredentialUnavailableError(errorMessage);
        }
        logger$2.info("Invoking getToken() of Client Assertion Credential");
        return this.clientAssertionCredential.getToken(scopes, options);
    }
    /**
     *
     * @param oidcRequestUrl - oidc request url
     * @param systemAccessToken - system access token
     * @returns OIDC token from Azure Pipelines
     */
    async requestOidcToken(oidcRequestUrl, systemAccessToken) {
        logger$2.info("Requesting OIDC token from Azure Pipelines...");
        logger$2.info(oidcRequestUrl);
        const request = coreRestPipeline.createPipelineRequest({
            url: oidcRequestUrl,
            method: "POST",
            headers: coreRestPipeline.createHttpHeaders({
                "Content-Type": "application/json",
                Authorization: `Bearer ${systemAccessToken}`,
                // Prevents the service from responding with a redirect HTTP status code (useful for automation).
                "X-TFS-FedAuthRedirect": "Suppress",
            }),
        });
        const response = await this.identityClient.sendRequest(request);
        return handleOidcResponse(response);
    }
}
function handleOidcResponse(response) {
    // OIDC token is present in `bodyAsText` field
    const text = response.bodyAsText;
    if (!text) {
        logger$2.error(`${credentialName$1}: Authentication Failed. Received null token from OIDC request. Response status- ${response.status}. Complete response - ${JSON.stringify(response)}`);
        throw new AuthenticationError(response.status, {
            error: `${credentialName$1}: Authentication Failed. Received null token from OIDC request.`,
            error_description: `${JSON.stringify(response)}. See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/azurepipelinescredential/troubleshoot`,
        });
    }
    try {
        const result = JSON.parse(text);
        if (result === null || result === void 0 ? void 0 : result.oidcToken) {
            return result.oidcToken;
        }
        else {
            const errorMessage = `${credentialName$1}: Authentication Failed. oidcToken field not detected in the response.`;
            let errorDescription = ``;
            if (response.status !== 200) {
                errorDescription = `Response body = ${text}. Response Headers ["x-vss-e2eid"] = ${response.headers.get("x-vss-e2eid")} and ["x-msedge-ref"] = ${response.headers.get("x-msedge-ref")}. See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/azurepipelinescredential/troubleshoot`;
            }
            logger$2.error(errorMessage);
            logger$2.error(errorDescription);
            throw new AuthenticationError(response.status, {
                error: errorMessage,
                error_description: errorDescription,
            });
        }
    }
    catch (e) {
        const errorDetails = `${credentialName$1}: Authentication Failed. oidcToken field not detected in the response.`;
        logger$2.error(`Response from service = ${text}, Response Headers ["x-vss-e2eid"] = ${response.headers.get("x-vss-e2eid")} 
      and ["x-msedge-ref"] = ${response.headers.get("x-msedge-ref")}, error message = ${e.message}`);
        logger$2.error(errorDetails);
        throw new AuthenticationError(response.status, {
            error: errorDetails,
            error_description: `Response = ${text}. Response headers ["x-vss-e2eid"] = ${response.headers.get("x-vss-e2eid")} and ["x-msedge-ref"] =  ${response.headers.get("x-msedge-ref")}. See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/azurepipelinescredential/troubleshoot`,
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const logger$1 = credentialLogger("AuthorizationCodeCredential");
/**
 * Enables authentication to Microsoft Entra ID using an authorization code
 * that was obtained through the authorization code flow, described in more detail
 * in the Microsoft Entra ID documentation:
 *
 * https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow
 */
class AuthorizationCodeCredential {
    /**
     * @hidden
     * @internal
     */
    constructor(tenantId, clientId, clientSecretOrAuthorizationCode, authorizationCodeOrRedirectUri, redirectUriOrOptions, options) {
        checkTenantId(logger$1, tenantId);
        this.clientSecret = clientSecretOrAuthorizationCode;
        if (typeof redirectUriOrOptions === "string") {
            // the clientId+clientSecret constructor
            this.authorizationCode = authorizationCodeOrRedirectUri;
            this.redirectUri = redirectUriOrOptions;
            // in this case, options are good as they come
        }
        else {
            // clientId only
            this.authorizationCode = clientSecretOrAuthorizationCode;
            this.redirectUri = authorizationCodeOrRedirectUri;
            this.clientSecret = undefined;
            options = redirectUriOrOptions;
        }
        // TODO: Validate tenant if provided
        this.tenantId = tenantId;
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(options === null || options === void 0 ? void 0 : options.additionallyAllowedTenants);
        this.msalClient = createMsalClient(clientId, tenantId, Object.assign(Object.assign({}, options), { logger: logger$1, tokenCredentialOptions: options !== null && options !== void 0 ? options : {} }));
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${this.constructor.name}.getToken`, options, async (newOptions) => {
            const tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds);
            newOptions.tenantId = tenantId;
            const arrayScopes = ensureScopes(scopes);
            return this.msalClient.getTokenByAuthorizationCode(arrayScopes, this.redirectUri, this.authorizationCode, this.clientSecret, Object.assign(Object.assign({}, newOptions), { disableAutomaticAuthentication: this.disableAutomaticAuthentication }));
        });
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const credentialName = "OnBehalfOfCredential";
const logger = credentialLogger(credentialName);
/**
 * Enables authentication to Microsoft Entra ID using the [On Behalf Of flow](https://learn.microsoft.com/entra/identity-platform/v2-oauth2-on-behalf-of-flow).
 */
class OnBehalfOfCredential {
    constructor(options) {
        const { clientSecret } = options;
        const { certificatePath, sendCertificateChain } = options;
        const { getAssertion } = options;
        const { tenantId, clientId, userAssertionToken, additionallyAllowedTenants: additionallyAllowedTenantIds, } = options;
        if (!tenantId) {
            throw new CredentialUnavailableError(`${credentialName}: tenantId is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.`);
        }
        if (!clientId) {
            throw new CredentialUnavailableError(`${credentialName}: clientId is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.`);
        }
        if (!clientSecret && !certificatePath && !getAssertion) {
            throw new CredentialUnavailableError(`${credentialName}: You must provide one of clientSecret, certificatePath, or a getAssertion callback but none were provided. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.`);
        }
        if (!userAssertionToken) {
            throw new CredentialUnavailableError(`${credentialName}: userAssertionToken is a required parameter. To troubleshoot, visit https://aka.ms/azsdk/js/identity/serviceprincipalauthentication/troubleshoot.`);
        }
        this.certificatePath = certificatePath;
        this.clientSecret = clientSecret;
        this.userAssertionToken = userAssertionToken;
        this.sendCertificateChain = sendCertificateChain;
        this.clientAssertion = getAssertion;
        this.tenantId = tenantId;
        this.additionallyAllowedTenantIds = resolveAdditionallyAllowedTenantIds(additionallyAllowedTenantIds);
        this.msalClient = createMsalClient(clientId, this.tenantId, Object.assign(Object.assign({}, options), { logger, tokenCredentialOptions: options }));
    }
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure the underlying network requests.
     */
    async getToken(scopes, options = {}) {
        return tracingClient.withSpan(`${credentialName}.getToken`, options, async (newOptions) => {
            newOptions.tenantId = processMultiTenantRequest(this.tenantId, newOptions, this.additionallyAllowedTenantIds, logger);
            const arrayScopes = ensureScopes(scopes);
            if (this.certificatePath) {
                const clientCertificate = await this.buildClientCertificate(this.certificatePath);
                return this.msalClient.getTokenOnBehalfOf(arrayScopes, this.userAssertionToken, clientCertificate, newOptions);
            }
            else if (this.clientSecret) {
                return this.msalClient.getTokenOnBehalfOf(arrayScopes, this.userAssertionToken, this.clientSecret, options);
            }
            else if (this.clientAssertion) {
                return this.msalClient.getTokenOnBehalfOf(arrayScopes, this.userAssertionToken, this.clientAssertion, options);
            }
            else {
                // this is an invalid scenario and is a bug, as the constructor should have thrown an error if neither clientSecret nor certificatePath nor clientAssertion were provided
                throw new Error("Expected either clientSecret or certificatePath or clientAssertion to be defined.");
            }
        });
    }
    async buildClientCertificate(certificatePath) {
        try {
            const parts = await this.parseCertificate({ certificatePath }, this.sendCertificateChain);
            return {
                thumbprint: parts.thumbprint,
                privateKey: parts.certificateContents,
                x5c: parts.x5c,
            };
        }
        catch (error) {
            logger.info(formatError("", error));
            throw error;
        }
    }
    async parseCertificate(configuration, sendCertificateChain) {
        const certificatePath = configuration.certificatePath;
        const certificateContents = await promises$1.readFile(certificatePath, "utf8");
        const x5c = sendCertificateChain ? certificateContents : undefined;
        const certificatePattern = /(-+BEGIN CERTIFICATE-+)(\n\r?|\r\n?)([A-Za-z0-9+/\n\r]+=*)(\n\r?|\r\n?)(-+END CERTIFICATE-+)/g;
        const publicKeys = [];
        // Match all possible certificates, in the order they are in the file. These will form the chain that is used for x5c
        let match;
        do {
            match = certificatePattern.exec(certificateContents);
            if (match) {
                publicKeys.push(match[3]);
            }
        } while (match);
        if (publicKeys.length === 0) {
            throw new Error("The file at the specified path does not contain a PEM-encoded certificate.");
        }
        const thumbprint = node_crypto.createHash("sha1")
            .update(Buffer.from(publicKeys[0], "base64"))
            .digest("hex")
            .toUpperCase();
        return {
            certificateContents,
            thumbprint,
            x5c,
        };
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Returns a callback that provides a bearer token.
 * For example, the bearer token can be used to authenticate a request as follows:
 * ```ts snippet:token_provider_example
 * import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
 * import { createPipelineRequest } from "@azure/core-rest-pipeline";
 *
 * const credential = new DefaultAzureCredential();
 * const scope = "https://cognitiveservices.azure.com/.default";
 * const getAccessToken = getBearerTokenProvider(credential, scope);
 * const token = await getAccessToken();
 * // usage
 * const request = createPipelineRequest({ url: "https://example.com" });
 * request.headers.set("Authorization", `Bearer ${token}`);
 * ```
 *
 * @param credential - The credential used to authenticate the request.
 * @param scopes - The scopes required for the bearer token.
 * @param options - Options to configure the token provider.
 * @returns a callback that provides a bearer token.
 */
function getBearerTokenProvider(credential, scopes, options) {
    const { abortSignal, tracingOptions } = options || {};
    const pipeline = coreRestPipeline.createEmptyPipeline();
    pipeline.addPolicy(coreRestPipeline.bearerTokenAuthenticationPolicy({ credential, scopes }));
    async function getRefreshedToken() {
        var _a;
        // Create a pipeline with just the bearer token policy
        // and run a dummy request through it to get the token
        const res = await pipeline.sendRequest({
            sendRequest: (request) => Promise.resolve({
                request,
                status: 200,
                headers: request.headers,
            }),
        }, coreRestPipeline.createPipelineRequest({
            url: "https://example.com",
            abortSignal,
            tracingOptions,
        }));
        const accessToken = (_a = res.headers.get("authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!accessToken) {
            throw new Error("Failed to get access token");
        }
        return accessToken;
    }
    return getRefreshedToken;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Returns a new instance of the {@link DefaultAzureCredential}.
 */
function getDefaultAzureCredential() {
    return new DefaultAzureCredential();
}

exports.AggregateAuthenticationError = AggregateAuthenticationError;
exports.AggregateAuthenticationErrorName = AggregateAuthenticationErrorName;
exports.AuthenticationError = AuthenticationError;
exports.AuthenticationErrorName = AuthenticationErrorName;
exports.AuthenticationRequiredError = AuthenticationRequiredError;
exports.AuthorizationCodeCredential = AuthorizationCodeCredential;
exports.AzureCliCredential = AzureCliCredential;
exports.AzureDeveloperCliCredential = AzureDeveloperCliCredential;
exports.AzurePipelinesCredential = AzurePipelinesCredential;
exports.AzurePowerShellCredential = AzurePowerShellCredential;
exports.ChainedTokenCredential = ChainedTokenCredential;
exports.ClientAssertionCredential = ClientAssertionCredential;
exports.ClientCertificateCredential = ClientCertificateCredential;
exports.ClientSecretCredential = ClientSecretCredential;
exports.CredentialUnavailableError = CredentialUnavailableError;
exports.CredentialUnavailableErrorName = CredentialUnavailableErrorName;
exports.DefaultAzureCredential = DefaultAzureCredential;
exports.DeviceCodeCredential = DeviceCodeCredential;
exports.EnvironmentCredential = EnvironmentCredential;
exports.InteractiveBrowserCredential = InteractiveBrowserCredential;
exports.ManagedIdentityCredential = ManagedIdentityCredential;
exports.OnBehalfOfCredential = OnBehalfOfCredential;
exports.UsernamePasswordCredential = UsernamePasswordCredential;
exports.VisualStudioCodeCredential = VisualStudioCodeCredential;
exports.WorkloadIdentityCredential = WorkloadIdentityCredential;
exports.deserializeAuthenticationRecord = deserializeAuthenticationRecord;
exports.getBearerTokenProvider = getBearerTokenProvider;
exports.getDefaultAzureCredential = getDefaultAzureCredential;
exports.logger = logger$l;
exports.serializeAuthenticationRecord = serializeAuthenticationRecord;
exports.useIdentityPlugin = useIdentityPlugin;
//# sourceMappingURL=index.js.map
