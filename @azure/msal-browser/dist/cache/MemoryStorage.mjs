/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class MemoryStorage {
    constructor() {
        this.cache = new Map();
    }
    async initialize() {
        // Memory storage does not require initialization
    }
    getItem(key) {
        return this.cache.get(key) || null;
    }
    getUserData(key) {
        return this.getItem(key);
    }
    setItem(key, value) {
        this.cache.set(key, value);
    }
    async setUserData(key, value) {
        this.setItem(key, value);
    }
    removeItem(key) {
        this.cache.delete(key);
    }
    getKeys() {
        const cacheKeys = [];
        this.cache.forEach((value, key) => {
            cacheKeys.push(key);
        });
        return cacheKeys;
    }
    containsKey(key) {
        return this.cache.has(key);
    }
    clear() {
        this.cache.clear();
    }
}

export { MemoryStorage };
//# sourceMappingURL=MemoryStorage.mjs.map
