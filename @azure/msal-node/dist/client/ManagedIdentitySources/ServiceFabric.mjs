/*! @azure/msal-node v2.16.2 2024-11-19 */
'use strict';
import { ManagedIdentityRequestParameters } from '../../config/ManagedIdentityRequestParameters.mjs';
import { BaseManagedIdentitySource } from './BaseManagedIdentitySource.mjs';
import { ManagedIdentityEnvironmentVariableNames, ManagedIdentitySourceNames, ManagedIdentityIdType, SERVICE_FABRIC_SECRET_HEADER_NAME, API_VERSION_QUERY_PARAMETER_NAME, RESOURCE_BODY_OR_QUERY_PARAMETER_NAME, HttpMethod } from '../../utils/Constants.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// MSI Constants. Docs for MSI are available here https://docs.microsoft.com/azure/app-service/overview-managed-identity
const SERVICE_FABRIC_MSI_API_VERSION = "2019-07-01-preview";
/**
 * Original source of code: https://github.com/Azure/azure-sdk-for-net/blob/main/sdk/identity/Azure.Identity/src/ServiceFabricManagedIdentitySource.cs
 */
class ServiceFabric extends BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader) {
        super(logger, nodeStorage, networkClient, cryptoProvider);
        this.identityEndpoint = identityEndpoint;
        this.identityHeader = identityHeader;
    }
    static getEnvironmentVariables() {
        const identityEndpoint = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT];
        const identityHeader = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER];
        const identityServerThumbprint = process.env[ManagedIdentityEnvironmentVariableNames
            .IDENTITY_SERVER_THUMBPRINT];
        return [identityEndpoint, identityHeader, identityServerThumbprint];
    }
    static tryCreate(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) {
        const [identityEndpoint, identityHeader, identityServerThumbprint] = ServiceFabric.getEnvironmentVariables();
        /*
         * if either of the identity endpoint, identity header, or identity server thumbprint
         * environment variables are undefined, this MSI provider is unavailable.
         */
        if (!identityEndpoint || !identityHeader || !identityServerThumbprint) {
            logger.info(`[Managed Identity] ${ManagedIdentitySourceNames.SERVICE_FABRIC} managed identity is unavailable because one or all of the '${ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER}', '${ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT}' or '${ManagedIdentityEnvironmentVariableNames.IDENTITY_SERVER_THUMBPRINT}' environment variables are not defined.`);
            return null;
        }
        const validatedIdentityEndpoint = ServiceFabric.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT, identityEndpoint, ManagedIdentitySourceNames.SERVICE_FABRIC, logger);
        logger.info(`[Managed Identity] Environment variables validation passed for ${ManagedIdentitySourceNames.SERVICE_FABRIC} managed identity. Endpoint URI: ${validatedIdentityEndpoint}. Creating ${ManagedIdentitySourceNames.SERVICE_FABRIC} managed identity.`);
        if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
            logger.warning(`[Managed Identity] ${ManagedIdentitySourceNames.SERVICE_FABRIC} user assigned managed identity is configured in the cluster, not during runtime. See also: https://learn.microsoft.com/en-us/azure/service-fabric/configure-existing-cluster-enable-managed-identity-token-service.`);
        }
        return new ServiceFabric(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader);
    }
    createRequest(resource, managedIdentityId) {
        const request = new ManagedIdentityRequestParameters(HttpMethod.GET, this.identityEndpoint);
        request.headers[SERVICE_FABRIC_SECRET_HEADER_NAME] =
            this.identityHeader;
        request.queryParameters[API_VERSION_QUERY_PARAMETER_NAME] =
            SERVICE_FABRIC_MSI_API_VERSION;
        request.queryParameters[RESOURCE_BODY_OR_QUERY_PARAMETER_NAME] =
            resource;
        if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
            request.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(managedIdentityId.idType)] = managedIdentityId.id;
        }
        // bodyParameters calculated in BaseManagedIdentity.acquireTokenWithManagedIdentity
        return request;
    }
}

export { ServiceFabric };
//# sourceMappingURL=ServiceFabric.mjs.map
