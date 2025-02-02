/*! @azure/msal-common v15.0.1 2025-01-15 */
'use strict';
import { AuthError } from './AuthError.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Error thrown when there is an error with the server code, for example, unavailability.
 */
class ServerError extends AuthError {
    constructor(errorCode, errorMessage, subError, errorNo, status) {
        super(errorCode, errorMessage, subError);
        this.name = "ServerError";
        this.errorNo = errorNo;
        this.status = status;
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}

export { ServerError };
//# sourceMappingURL=ServerError.mjs.map
