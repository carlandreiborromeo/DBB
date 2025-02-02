/*! @azure/msal-node v2.16.2 2024-11-19 */
'use strict';
import { BaseManagedIdentitySource } from './BaseManagedIdentitySource.mjs';
import { ManagedIdentityEnvironmentVariableNames, ManagedIdentitySourceNames, APP_SERVICE_SECRET_HEADER_NAME, API_VERSION_QUERY_PARAMETER_NAME, RESOURCE_BODY_OR_QUERY_PARAMETER_NAME, ManagedIdentityIdType, HttpMethod } from '../../utils/Constants.mjs';
import { ManagedIdentityRequestParameters } from '../../config/ManagedIdentityRequestParameters.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// MSI Constants. Docs for MSI are available here https://docs.microsoft.com/azure/app-service/overview-managed-identity
const APP_SERVICE_MSI_API_VERSION = "2019-08-01";
/**
 * Original source of code: https://github.com/Azure/azure-sdk-for-net/blob/main/sdk/identity/Azure.Identity/src/AppServiceManagedIdentitySource.cs
 */
class AppService extends BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader) {
        super(logger, nodeStorage, networkClient, cryptoProvider);
        this.identityEndpoint = identityEndpoint;
        this.identityHeader = identityHeader;
    }
    static getEnvironmentVariables() {
        const identityEndpoint = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT];
        const identityHeader = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER];
        return [identityEndpoint, identityHeader];
    }
    static tryCreate(logger, nodeStorage, networkClient, cryptoProvider) {
        const [identityEndpoint, identityHeader] = AppService.getEnvironmentVariables();
        // if either of the identity endpoint or identity header variables are undefined, this MSI provider is unavailable.
        if (!identityEndpoint || !identityHeader) {
            logger.info(`[Managed Identity] ${ManagedIdentitySourceNames.APP_SERVICE} managed identity is unavailable because one or both of the '${ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER}' and '${ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT}' environment variables are not defined.`);
            return null;
        }
        const validatedIdentityEndpoint = AppService.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT, identityEndpoint, ManagedIdentitySourceNames.APP_SERVICE, logger);
        logger.info(`[Managed Identity] Environment variables validation passed for ${ManagedIdentitySourceNames.APP_SERVICE} managed identity. Endpoint URI: ${validatedIdentityEndpoint}. Creating ${ManagedIdentitySourceNames.APP_SERVICE} managed identity.`);
        return new AppService(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader);
    }
    createRequest(resource, managedIdentityId) {
        const request = new ManagedIdentityRequestParameters(HttpMethod.GET, this.identityEndpoint);
        request.headers[APP_SERVICE_SECRET_HEADER_NAME] = this.identityHeader;
        request.queryParameters[API_VERSION_QUERY_PARAMETER_NAME] =
            APP_SERVICE_MSI_API_VERSION;
        request.queryParameters[RESOURCE_BODY_OR_QUERY_PARAMETER_NAME] =
            resource;
        if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
            request.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(managedIdentityId.idType)] = managedIdentityId.id;
        }
        // bodyParameters calculated in BaseManagedIdentity.acquireTokenWithManagedIdentity
        return request;
    }
}

export { AppService };
//# sourceMappingURL=AppService.mjs.map
