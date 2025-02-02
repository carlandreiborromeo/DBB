/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { AuthError } from '@azure/msal-common/browser';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * NestedAppAuthErrorMessage class containing string constants used by error codes and messages.
 */
const NestedAppAuthErrorMessage = {
    unsupportedMethod: {
        code: "unsupported_method",
        desc: "This method is not supported in nested app environment.",
    },
};
class NestedAppAuthError extends AuthError {
    constructor(errorCode, errorMessage) {
        super(errorCode, errorMessage);
        Object.setPrototypeOf(this, NestedAppAuthError.prototype);
        this.name = "NestedAppAuthError";
    }
    static createUnsupportedError() {
        return new NestedAppAuthError(NestedAppAuthErrorMessage.unsupportedMethod.code, NestedAppAuthErrorMessage.unsupportedMethod.desc);
    }
}

export { NestedAppAuthError, NestedAppAuthErrorMessage };
//# sourceMappingURL=NestedAppAuthError.mjs.map
