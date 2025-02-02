/*! @azure/msal-common v15.0.1 2025-01-15 */
'use strict';
import { cacheUnknownErrorCode, cacheQuotaExceededErrorCode } from './CacheErrorCodes.mjs';
import * as CacheErrorCodes from './CacheErrorCodes.mjs';
export { CacheErrorCodes };

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const CacheErrorMessages = {
    [cacheQuotaExceededErrorCode]: "Exceeded cache storage capacity.",
    [cacheUnknownErrorCode]: "Unexpected error occurred when using cache storage.",
};
/**
 * Error thrown when there is an error with the cache
 */
class CacheError extends Error {
    constructor(errorCode, errorMessage) {
        const message = errorMessage ||
            (CacheErrorMessages[errorCode]
                ? CacheErrorMessages[errorCode]
                : CacheErrorMessages[cacheUnknownErrorCode]);
        super(`${errorCode}: ${message}`);
        Object.setPrototypeOf(this, CacheError.prototype);
        this.name = "CacheError";
        this.errorCode = errorCode;
        this.errorMessage = message;
    }
}

export { CacheError, CacheErrorMessages };
//# sourceMappingURL=CacheError.mjs.map
