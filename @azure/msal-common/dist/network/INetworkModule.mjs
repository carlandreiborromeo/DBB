/*! @azure/msal-common v15.0.1 2025-01-15 */
'use strict';
import { createClientAuthError } from '../error/ClientAuthError.mjs';
import { methodNotImplemented } from '../error/ClientAuthErrorCodes.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const StubbedNetworkModule = {
    sendGetRequestAsync: () => {
        return Promise.reject(createClientAuthError(methodNotImplemented));
    },
    sendPostRequestAsync: () => {
        return Promise.reject(createClientAuthError(methodNotImplemented));
    },
};

export { StubbedNetworkModule };
//# sourceMappingURL=INetworkModule.mjs.map
