/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { OIDC_DEFAULT_SCOPES } from '@azure/msal-common/browser';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Constants
 */
const BrowserConstants = {
    /**
     * Interaction in progress cache value
     */
    INTERACTION_IN_PROGRESS_VALUE: "interaction_in_progress",
    /**
     * Invalid grant error code
     */
    INVALID_GRANT_ERROR: "invalid_grant",
    /**
     * Default popup window width
     */
    POPUP_WIDTH: 483,
    /**
     * Default popup window height
     */
    POPUP_HEIGHT: 600,
    /**
     * Name of the popup window starts with
     */
    POPUP_NAME_PREFIX: "msal",
    /**
     * Default popup monitor poll interval in milliseconds
     */
    DEFAULT_POLL_INTERVAL_MS: 30,
    /**
     * Msal-browser SKU
     */
    MSAL_SKU: "msal.js.browser",
};
const NativeConstants = {
    CHANNEL_ID: "53ee284d-920a-4b59-9d30-a60315b26836",
    PREFERRED_EXTENSION_ID: "ppnbnpeolgkicgegkbkbjmhlideopiji",
    MATS_TELEMETRY: "MATS",
};
const NativeExtensionMethod = {
    HandshakeRequest: "Handshake",
    HandshakeResponse: "HandshakeResponse",
    GetToken: "GetToken",
    Response: "Response",
};
const BrowserCacheLocation = {
    LocalStorage: "localStorage",
    SessionStorage: "sessionStorage",
    MemoryStorage: "memoryStorage",
};
/**
 * HTTP Request types supported by MSAL.
 */
const HTTP_REQUEST_TYPE = {
    GET: "GET",
    POST: "POST",
};
/**
 * Temporary cache keys for MSAL, deleted after any request.
 */
const TemporaryCacheKeys = {
    AUTHORITY: "authority",
    ACQUIRE_TOKEN_ACCOUNT: "acquireToken.account",
    SESSION_STATE: "session.state",
    REQUEST_STATE: "request.state",
    NONCE_IDTOKEN: "nonce.id_token",
    ORIGIN_URI: "request.origin",
    RENEW_STATUS: "token.renew.status",
    URL_HASH: "urlHash",
    REQUEST_PARAMS: "request.params",
    SCOPES: "scopes",
    INTERACTION_STATUS_KEY: "interaction.status",
    CCS_CREDENTIAL: "ccs.credential",
    CORRELATION_ID: "request.correlationId",
    NATIVE_REQUEST: "request.native",
    REDIRECT_CONTEXT: "request.redirect.context",
};
const StaticCacheKeys = {
    ACCOUNT_KEYS: "msal.account.keys",
    TOKEN_KEYS: "msal.token.keys",
};
/**
 * Cache keys stored in-memory
 */
const InMemoryCacheKeys = {
    WRAPPER_SKU: "wrapper.sku",
    WRAPPER_VER: "wrapper.version",
};
/**
 * API Codes for Telemetry purposes.
 * Before adding a new code you must claim it in the MSAL Telemetry tracker as these number spaces are shared across all MSALs
 * 0-99 Silent Flow
 * 800-899 Auth Code Flow
 */
const ApiId = {
    acquireTokenRedirect: 861,
    acquireTokenPopup: 862,
    ssoSilent: 863,
    acquireTokenSilent_authCode: 864,
    handleRedirectPromise: 865,
    acquireTokenByCode: 866,
    acquireTokenSilent_silentFlow: 61,
    logout: 961,
    logoutPopup: 962,
};
/*
 * Interaction type of the API - used for state and telemetry
 */
var InteractionType;
(function (InteractionType) {
    InteractionType["Redirect"] = "redirect";
    InteractionType["Popup"] = "popup";
    InteractionType["Silent"] = "silent";
    InteractionType["None"] = "none";
})(InteractionType || (InteractionType = {}));
/**
 * Types of interaction currently in progress.
 * Used in events in wrapper libraries to invoke functions when certain interaction is in progress or all interactions are complete.
 */
const InteractionStatus = {
    /**
     * Initial status before interaction occurs
     */
    Startup: "startup",
    /**
     * Status set when all login calls occuring
     */
    Login: "login",
    /**
     * Status set when logout call occuring
     */
    Logout: "logout",
    /**
     * Status set for acquireToken calls
     */
    AcquireToken: "acquireToken",
    /**
     * Status set for ssoSilent calls
     */
    SsoSilent: "ssoSilent",
    /**
     * Status set when handleRedirect in progress
     */
    HandleRedirect: "handleRedirect",
    /**
     * Status set when interaction is complete
     */
    None: "none",
};
const DEFAULT_REQUEST = {
    scopes: OIDC_DEFAULT_SCOPES,
};
/**
 * JWK Key Format string (Type MUST be defined for window crypto APIs)
 */
const KEY_FORMAT_JWK = "jwk";
// Supported wrapper SKUs
const WrapperSKU = {
    React: "@azure/msal-react",
    Angular: "@azure/msal-angular",
};
// DatabaseStorage Constants
const DB_NAME = "msal.db";
const DB_VERSION = 1;
const DB_TABLE_NAME = `${DB_NAME}.keys`;
const CacheLookupPolicy = {
    /*
     * acquireTokenSilent will attempt to retrieve an access token from the cache. If the access token is expired
     * or cannot be found the refresh token will be used to acquire a new one. Finally, if the refresh token
     * is expired acquireTokenSilent will attempt to acquire new access and refresh tokens.
     */
    Default: 0,
    /*
     * acquireTokenSilent will only look for access tokens in the cache. It will not attempt to renew access or
     * refresh tokens.
     */
    AccessToken: 1,
    /*
     * acquireTokenSilent will attempt to retrieve an access token from the cache. If the access token is expired or
     * cannot be found, the refresh token will be used to acquire a new one. If the refresh token is expired, it
     * will not be renewed and acquireTokenSilent will fail.
     */
    AccessTokenAndRefreshToken: 2,
    /*
     * acquireTokenSilent will not attempt to retrieve access tokens from the cache and will instead attempt to
     * exchange the cached refresh token for a new access token. If the refresh token is expired, it will not be
     * renewed and acquireTokenSilent will fail.
     */
    RefreshToken: 3,
    /*
     * acquireTokenSilent will not look in the cache for the access token. It will go directly to network with the
     * cached refresh token. If the refresh token is expired an attempt will be made to renew it. This is equivalent to
     * setting "forceRefresh: true".
     */
    RefreshTokenAndNetwork: 4,
    /*
     * acquireTokenSilent will attempt to renew both access and refresh tokens. It will not look in the cache. This will
     * always fail if 3rd party cookies are blocked by the browser.
     */
    Skip: 5,
};
const iFrameRenewalPolicies = [
    CacheLookupPolicy.Default,
    CacheLookupPolicy.Skip,
    CacheLookupPolicy.RefreshTokenAndNetwork,
];
const LOG_LEVEL_CACHE_KEY = "msal.browser.log.level";
const LOG_PII_CACHE_KEY = "msal.browser.log.pii";
const BROWSER_PERF_ENABLED_KEY = "msal.browser.performance.enabled";

export { ApiId, BROWSER_PERF_ENABLED_KEY, BrowserCacheLocation, BrowserConstants, CacheLookupPolicy, DB_NAME, DB_TABLE_NAME, DB_VERSION, DEFAULT_REQUEST, HTTP_REQUEST_TYPE, InMemoryCacheKeys, InteractionStatus, InteractionType, KEY_FORMAT_JWK, LOG_LEVEL_CACHE_KEY, LOG_PII_CACHE_KEY, NativeConstants, NativeExtensionMethod, StaticCacheKeys, TemporaryCacheKeys, WrapperSKU, iFrameRenewalPolicies };
//# sourceMappingURL=BrowserConstants.mjs.map
