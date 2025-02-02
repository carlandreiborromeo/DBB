/*! @azure/msal-node v2.16.2 2024-11-19 */
'use strict';
import { HttpStatus } from '@azure/msal-common/node';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// MSI Constants. Docs for MSI are available here https://docs.microsoft.com/azure/app-service/overview-managed-identity
const AUTHORIZATION_HEADER_NAME = "Authorization";
const METADATA_HEADER_NAME = "Metadata";
const APP_SERVICE_SECRET_HEADER_NAME = "X-IDENTITY-HEADER";
const SERVICE_FABRIC_SECRET_HEADER_NAME = "secret";
const API_VERSION_QUERY_PARAMETER_NAME = "api-version";
const RESOURCE_BODY_OR_QUERY_PARAMETER_NAME = "resource";
const DEFAULT_MANAGED_IDENTITY_ID = "system_assigned_managed_identity";
const MANAGED_IDENTITY_DEFAULT_TENANT = "managed_identity";
const DEFAULT_AUTHORITY_FOR_MANAGED_IDENTITY = `https://login.microsoftonline.com/${MANAGED_IDENTITY_DEFAULT_TENANT}/`;
/**
 * Managed Identity Environment Variable Names
 */
const ManagedIdentityEnvironmentVariableNames = {
    AZURE_POD_IDENTITY_AUTHORITY_HOST: "AZURE_POD_IDENTITY_AUTHORITY_HOST",
    IDENTITY_ENDPOINT: "IDENTITY_ENDPOINT",
    IDENTITY_HEADER: "IDENTITY_HEADER",
    IDENTITY_SERVER_THUMBPRINT: "IDENTITY_SERVER_THUMBPRINT",
    IMDS_ENDPOINT: "IMDS_ENDPOINT",
    MSI_ENDPOINT: "MSI_ENDPOINT",
};
/**
 * Managed Identity Source Names
 * @public
 */
const ManagedIdentitySourceNames = {
    APP_SERVICE: "AppService",
    AZURE_ARC: "AzureArc",
    CLOUD_SHELL: "CloudShell",
    DEFAULT_TO_IMDS: "DefaultToImds",
    IMDS: "Imds",
    SERVICE_FABRIC: "ServiceFabric",
};
/**
 * Managed Identity Ids
 */
const ManagedIdentityIdType = {
    SYSTEM_ASSIGNED: "system-assigned",
    USER_ASSIGNED_CLIENT_ID: "user-assigned-client-id",
    USER_ASSIGNED_RESOURCE_ID: "user-assigned-resource-id",
    USER_ASSIGNED_OBJECT_ID: "user-assigned-object-id",
};
/**
 * http methods
 */
const HttpMethod = {
    GET: "get",
    POST: "post",
};
const ProxyStatus = {
    SUCCESS: HttpStatus.SUCCESS,
    SUCCESS_RANGE_START: HttpStatus.SUCCESS_RANGE_START,
    SUCCESS_RANGE_END: HttpStatus.SUCCESS_RANGE_END,
    SERVER_ERROR: HttpStatus.SERVER_ERROR,
};
/**
 * Constants used for region discovery
 */
const REGION_ENVIRONMENT_VARIABLE = "REGION_NAME";
const MSAL_FORCE_REGION = "MSAL_FORCE_REGION";
/**
 * Constant used for PKCE
 */
const RANDOM_OCTET_SIZE = 32;
/**
 * Constants used in PKCE
 */
const Hash = {
    SHA256: "sha256",
};
/**
 * Constants for encoding schemes
 */
const CharSet = {
    CV_CHARSET: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",
};
/**
 * Constants
 */
const Constants = {
    MSAL_SKU: "msal.js.node",
    JWT_BEARER_ASSERTION_TYPE: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    AUTHORIZATION_PENDING: "authorization_pending",
    HTTP_PROTOCOL: "http://",
    LOCALHOST: "localhost",
};
/**
 * API Codes for Telemetry purposes.
 * Before adding a new code you must claim it in the MSAL Telemetry tracker as these number spaces are shared across all MSALs
 * 0-99 Silent Flow
 * 600-699 Device Code Flow
 * 800-899 Auth Code Flow
 */
const ApiId = {
    acquireTokenSilent: 62,
    acquireTokenByUsernamePassword: 371,
    acquireTokenByDeviceCode: 671,
    acquireTokenByClientCredential: 771,
    acquireTokenByCode: 871,
    acquireTokenByRefreshToken: 872,
};
/**
 * JWT  constants
 */
const JwtConstants = {
    ALGORITHM: "alg",
    RSA_256: "RS256",
    PSS_256: "PS256",
    X5T_256: "x5t#S256",
    X5T: "x5t",
    X5C: "x5c",
    AUDIENCE: "aud",
    EXPIRATION_TIME: "exp",
    ISSUER: "iss",
    SUBJECT: "sub",
    NOT_BEFORE: "nbf",
    JWT_ID: "jti",
};
const LOOPBACK_SERVER_CONSTANTS = {
    INTERVAL_MS: 100,
    TIMEOUT_MS: 5000,
};
const AZURE_ARC_SECRET_FILE_MAX_SIZE_BYTES = 4096; // 4 KB
const MANAGED_IDENTITY_MAX_RETRIES = 3;
const MANAGED_IDENTITY_RETRY_DELAY = 1000;
const MANAGED_IDENTITY_HTTP_STATUS_CODES_TO_RETRY_ON = [
    HttpStatus.NOT_FOUND,
    HttpStatus.REQUEST_TIMEOUT,
    HttpStatus.TOO_MANY_REQUESTS,
    HttpStatus.SERVER_ERROR,
    HttpStatus.SERVICE_UNAVAILABLE,
    HttpStatus.GATEWAY_TIMEOUT,
];

export { API_VERSION_QUERY_PARAMETER_NAME, APP_SERVICE_SECRET_HEADER_NAME, AUTHORIZATION_HEADER_NAME, AZURE_ARC_SECRET_FILE_MAX_SIZE_BYTES, ApiId, CharSet, Constants, DEFAULT_AUTHORITY_FOR_MANAGED_IDENTITY, DEFAULT_MANAGED_IDENTITY_ID, Hash, HttpMethod, JwtConstants, LOOPBACK_SERVER_CONSTANTS, MANAGED_IDENTITY_DEFAULT_TENANT, MANAGED_IDENTITY_HTTP_STATUS_CODES_TO_RETRY_ON, MANAGED_IDENTITY_MAX_RETRIES, MANAGED_IDENTITY_RETRY_DELAY, METADATA_HEADER_NAME, MSAL_FORCE_REGION, ManagedIdentityEnvironmentVariableNames, ManagedIdentityIdType, ManagedIdentitySourceNames, ProxyStatus, RANDOM_OCTET_SIZE, REGION_ENVIRONMENT_VARIABLE, RESOURCE_BODY_OR_QUERY_PARAMETER_NAME, SERVICE_FABRIC_SECRET_HEADER_NAME };
//# sourceMappingURL=Constants.mjs.map
