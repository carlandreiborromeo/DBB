/*! @azure/msal-node v2.16.2 2024-11-19 */
'use strict';
import { Constants, ProtocolMode, AzureCloudInstance, LogLevel } from '@azure/msal-common/node';
import { HttpClient } from '../network/HttpClient.mjs';
import { ManagedIdentityId } from './ManagedIdentityId.mjs';
import { MANAGED_IDENTITY_MAX_RETRIES, MANAGED_IDENTITY_RETRY_DELAY, MANAGED_IDENTITY_HTTP_STATUS_CODES_TO_RETRY_ON } from '../utils/Constants.mjs';
import { LinearRetryPolicy } from '../retry/LinearRetryPolicy.mjs';
import { HttpClientWithRetries } from '../network/HttpClientWithRetries.mjs';
import { NodeAuthError } from '../error/NodeAuthError.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const DEFAULT_AUTH_OPTIONS = {
    clientId: Constants.EMPTY_STRING,
    authority: Constants.DEFAULT_AUTHORITY,
    clientSecret: Constants.EMPTY_STRING,
    clientAssertion: Constants.EMPTY_STRING,
    clientCertificate: {
        thumbprint: Constants.EMPTY_STRING,
        thumbprintSha256: Constants.EMPTY_STRING,
        privateKey: Constants.EMPTY_STRING,
        x5c: Constants.EMPTY_STRING,
    },
    knownAuthorities: [],
    cloudDiscoveryMetadata: Constants.EMPTY_STRING,
    authorityMetadata: Constants.EMPTY_STRING,
    clientCapabilities: [],
    protocolMode: ProtocolMode.AAD,
    azureCloudOptions: {
        azureCloudInstance: AzureCloudInstance.None,
        tenant: Constants.EMPTY_STRING,
    },
    skipAuthorityMetadataCache: false,
};
const DEFAULT_CACHE_OPTIONS = {
    claimsBasedCachingEnabled: false,
};
const DEFAULT_LOGGER_OPTIONS = {
    loggerCallback: () => {
        // allow users to not set logger call back
    },
    piiLoggingEnabled: false,
    logLevel: LogLevel.Info,
};
const DEFAULT_SYSTEM_OPTIONS = {
    loggerOptions: DEFAULT_LOGGER_OPTIONS,
    networkClient: new HttpClient(),
    proxyUrl: Constants.EMPTY_STRING,
    customAgentOptions: {},
    disableInternalRetries: false,
};
const DEFAULT_TELEMETRY_OPTIONS = {
    application: {
        appName: Constants.EMPTY_STRING,
        appVersion: Constants.EMPTY_STRING,
    },
};
/**
 * Sets the default options when not explicitly configured from app developer
 *
 * @param auth - Authentication options
 * @param cache - Cache options
 * @param system - System options
 * @param telemetry - Telemetry options
 *
 * @returns Configuration
 * @internal
 */
function buildAppConfiguration({ auth, broker, cache, system, telemetry, }) {
    const systemOptions = {
        ...DEFAULT_SYSTEM_OPTIONS,
        networkClient: new HttpClient(system?.proxyUrl, system?.customAgentOptions),
        loggerOptions: system?.loggerOptions || DEFAULT_LOGGER_OPTIONS,
        disableInternalRetries: system?.disableInternalRetries || false,
    };
    // if client certificate was provided, ensure that at least one of the SHA-1 or SHA-256 thumbprints were provided
    if (!!auth.clientCertificate &&
        !!!auth.clientCertificate.thumbprint &&
        !!!auth.clientCertificate.thumbprintSha256) {
        throw NodeAuthError.createStateNotFoundError();
    }
    return {
        auth: { ...DEFAULT_AUTH_OPTIONS, ...auth },
        broker: { ...broker },
        cache: { ...DEFAULT_CACHE_OPTIONS, ...cache },
        system: { ...systemOptions, ...system },
        telemetry: { ...DEFAULT_TELEMETRY_OPTIONS, ...telemetry },
    };
}
function buildManagedIdentityConfiguration({ managedIdentityIdParams, system, }) {
    const managedIdentityId = new ManagedIdentityId(managedIdentityIdParams);
    const loggerOptions = system?.loggerOptions || DEFAULT_LOGGER_OPTIONS;
    let networkClient;
    // use developer provided network client if passed in
    if (system?.networkClient) {
        networkClient = system.networkClient;
        // otherwise, create a new one
    }
    else {
        networkClient = new HttpClient(system?.proxyUrl, system?.customAgentOptions);
    }
    // wrap the network client with a retry policy if the developer has not disabled the option to do so
    if (!system?.disableInternalRetries) {
        const linearRetryPolicy = new LinearRetryPolicy(MANAGED_IDENTITY_MAX_RETRIES, MANAGED_IDENTITY_RETRY_DELAY, MANAGED_IDENTITY_HTTP_STATUS_CODES_TO_RETRY_ON);
        networkClient = new HttpClientWithRetries(networkClient, linearRetryPolicy);
    }
    return {
        managedIdentityId: managedIdentityId,
        system: {
            loggerOptions,
            networkClient,
        },
    };
}

export { buildAppConfiguration, buildManagedIdentityConfiguration };
//# sourceMappingURL=Configuration.mjs.map
