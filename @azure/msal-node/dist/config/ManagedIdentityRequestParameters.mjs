/*! @azure/msal-node v2.16.2 2024-11-19 */
'use strict';
import { RequestParameterBuilder, UrlString } from '@azure/msal-common/node';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class ManagedIdentityRequestParameters {
    constructor(httpMethod, endpoint) {
        this.httpMethod = httpMethod;
        this._baseEndpoint = endpoint;
        this.headers = {};
        this.bodyParameters = {};
        this.queryParameters = {};
    }
    computeUri() {
        const parameterBuilder = new RequestParameterBuilder();
        if (this.queryParameters) {
            parameterBuilder.addExtraQueryParameters(this.queryParameters);
        }
        const queryParametersString = parameterBuilder.createQueryString();
        return UrlString.appendQueryString(this._baseEndpoint, queryParametersString);
    }
    computeParametersBodyString() {
        const parameterBuilder = new RequestParameterBuilder();
        if (this.bodyParameters) {
            parameterBuilder.addExtraQueryParameters(this.bodyParameters);
        }
        return parameterBuilder.createQueryString();
    }
}

export { ManagedIdentityRequestParameters };
//# sourceMappingURL=ManagedIdentityRequestParameters.mjs.map
