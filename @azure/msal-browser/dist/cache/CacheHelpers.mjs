/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { StaticCacheKeys } from '../utils/BrowserConstants.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Returns a list of cache keys for all known accounts
 * @param storage
 * @returns
 */
function getAccountKeys(storage) {
    const accountKeys = storage.getItem(StaticCacheKeys.ACCOUNT_KEYS);
    if (accountKeys) {
        return JSON.parse(accountKeys);
    }
    return [];
}
/**
 * Returns a list of cache keys for all known tokens
 * @param clientId
 * @param storage
 * @returns
 */
function getTokenKeys(clientId, storage) {
    const item = storage.getItem(`${StaticCacheKeys.TOKEN_KEYS}.${clientId}`);
    if (item) {
        const tokenKeys = JSON.parse(item);
        if (tokenKeys &&
            tokenKeys.hasOwnProperty("idToken") &&
            tokenKeys.hasOwnProperty("accessToken") &&
            tokenKeys.hasOwnProperty("refreshToken")) {
            return tokenKeys;
        }
    }
    return {
        idToken: [],
        accessToken: [],
        refreshToken: [],
    };
}

export { getAccountKeys, getTokenKeys };
//# sourceMappingURL=CacheHelpers.mjs.map
