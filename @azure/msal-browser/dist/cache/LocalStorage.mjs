/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { invoke, PerformanceEvents, invokeAsync, Constants } from '@azure/msal-common/browser';
import { generateHKDF, createNewGuid, generateBaseKey, encrypt, decrypt } from '../crypto/BrowserCrypto.mjs';
import { base64DecToArr } from '../encode/Base64Decode.mjs';
import { urlEncodeArr } from '../encode/Base64Encode.mjs';
import { createBrowserAuthError } from '../error/BrowserAuthError.mjs';
import { createBrowserConfigurationAuthError } from '../error/BrowserConfigurationAuthError.mjs';
import { CookieStorage } from './CookieStorage.mjs';
import { MemoryStorage } from './MemoryStorage.mjs';
import { getAccountKeys, getTokenKeys } from './CacheHelpers.mjs';
import { StaticCacheKeys } from '../utils/BrowserConstants.mjs';
import { storageNotSupported } from '../error/BrowserConfigurationAuthErrorCodes.mjs';
import { uninitializedPublicClientApplication } from '../error/BrowserAuthErrorCodes.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const ENCRYPTION_KEY = "msal.cache.encryption";
class LocalStorage {
    constructor(clientId, logger, performanceClient) {
        if (!window.localStorage) {
            throw createBrowserConfigurationAuthError(storageNotSupported);
        }
        this.memoryStorage = new MemoryStorage();
        this.initialized = false;
        this.clientId = clientId;
        this.logger = logger;
        this.performanceClient = performanceClient;
    }
    async initialize(correlationId) {
        this.initialized = true;
        const cookies = new CookieStorage();
        const cookieString = cookies.getItem(ENCRYPTION_KEY);
        let parsedCookie = { key: "", id: "" };
        if (cookieString) {
            try {
                parsedCookie = JSON.parse(cookieString);
            }
            catch (e) { }
        }
        if (parsedCookie.key && parsedCookie.id) {
            // Encryption key already exists, import
            const baseKey = invoke(base64DecToArr, PerformanceEvents.Base64Decode, this.logger, this.performanceClient, correlationId)(parsedCookie.key);
            this.encryptionCookie = {
                id: parsedCookie.id,
                key: await invokeAsync(generateHKDF, PerformanceEvents.GenerateHKDF, this.logger, this.performanceClient, correlationId)(baseKey),
            };
            await invokeAsync(this.importExistingCache.bind(this), PerformanceEvents.ImportExistingCache, this.logger, this.performanceClient, correlationId)(correlationId);
        }
        else {
            // Encryption key doesn't exist or is invalid, generate a new one and clear existing cache
            this.clear();
            const id = createNewGuid();
            const baseKey = await invokeAsync(generateBaseKey, PerformanceEvents.GenerateBaseKey, this.logger, this.performanceClient, correlationId)();
            const keyStr = invoke(urlEncodeArr, PerformanceEvents.UrlEncodeArr, this.logger, this.performanceClient, correlationId)(new Uint8Array(baseKey));
            this.encryptionCookie = {
                id: id,
                key: await invokeAsync(generateHKDF, PerformanceEvents.GenerateHKDF, this.logger, this.performanceClient, correlationId)(baseKey),
            };
            const cookieData = {
                id: id,
                key: keyStr,
            };
            cookies.setItem(ENCRYPTION_KEY, JSON.stringify(cookieData));
        }
    }
    getItem(key) {
        return window.localStorage.getItem(key);
    }
    getUserData(key) {
        if (!this.initialized) {
            throw createBrowserAuthError(uninitializedPublicClientApplication);
        }
        return this.memoryStorage.getItem(key);
    }
    setItem(key, value) {
        window.localStorage.setItem(key, value);
    }
    async setUserData(key, value, correlationId) {
        if (!this.initialized || !this.encryptionCookie) {
            throw createBrowserAuthError(uninitializedPublicClientApplication);
        }
        const { data, nonce } = await invokeAsync(encrypt, PerformanceEvents.Encrypt, this.logger, this.performanceClient, correlationId)(this.encryptionCookie.key, value, this.getContext(key));
        const encryptedData = {
            id: this.encryptionCookie.id,
            nonce: nonce,
            data: data,
        };
        this.memoryStorage.setItem(key, value);
        this.setItem(key, JSON.stringify(encryptedData));
    }
    removeItem(key) {
        this.memoryStorage.removeItem(key);
        window.localStorage.removeItem(key);
    }
    getKeys() {
        return Object.keys(window.localStorage);
    }
    containsKey(key) {
        return window.localStorage.hasOwnProperty(key);
    }
    /**
     * Removes all known MSAL keys from the cache
     */
    clear() {
        // Removes all remaining MSAL cache items
        this.memoryStorage.clear();
        const accountKeys = getAccountKeys(this);
        accountKeys.forEach((key) => this.removeItem(key));
        const tokenKeys = getTokenKeys(this.clientId, this);
        tokenKeys.idToken.forEach((key) => this.removeItem(key));
        tokenKeys.accessToken.forEach((key) => this.removeItem(key));
        tokenKeys.refreshToken.forEach((key) => this.removeItem(key));
        // Clean up anything left
        this.getKeys().forEach((cacheKey) => {
            if (cacheKey.startsWith(Constants.CACHE_PREFIX) ||
                cacheKey.indexOf(this.clientId) !== -1) {
                this.removeItem(cacheKey);
            }
        });
    }
    /**
     * Helper to decrypt all known MSAL keys in localStorage and save them to inMemory storage
     * @returns
     */
    async importExistingCache(correlationId) {
        if (!this.encryptionCookie) {
            return;
        }
        let accountKeys = getAccountKeys(this);
        accountKeys = await this.importArray(accountKeys, correlationId);
        // Write valid account keys back to map
        this.setItem(StaticCacheKeys.ACCOUNT_KEYS, JSON.stringify(accountKeys));
        const tokenKeys = getTokenKeys(this.clientId, this);
        tokenKeys.idToken = await this.importArray(tokenKeys.idToken, correlationId);
        tokenKeys.accessToken = await this.importArray(tokenKeys.accessToken, correlationId);
        tokenKeys.refreshToken = await this.importArray(tokenKeys.refreshToken, correlationId);
        // Write valid token keys back to map
        this.setItem(`${StaticCacheKeys.TOKEN_KEYS}.${this.clientId}`, JSON.stringify(tokenKeys));
    }
    /**
     * Helper to decrypt and save cache entries
     * @param key
     * @returns
     */
    async getItemFromEncryptedCache(key, correlationId) {
        if (!this.encryptionCookie) {
            return null;
        }
        const rawCache = this.getItem(key);
        if (!rawCache) {
            return null;
        }
        let encObj;
        try {
            encObj = JSON.parse(rawCache);
        }
        catch (e) {
            // Not a valid encrypted object, remove
            return null;
        }
        if (!encObj.id || !encObj.nonce || !encObj.data) {
            // Data is not encrypted, likely from old version of MSAL. It must be removed because we don't know how old it is.
            this.performanceClient.incrementFields({ unencryptedCacheCount: 1 }, correlationId);
            return null;
        }
        if (encObj.id !== this.encryptionCookie.id) {
            // Data was encrypted with a different key. It must be removed because it is from a previous session.
            this.performanceClient.incrementFields({ encryptedCacheExpiredCount: 1 }, correlationId);
            return null;
        }
        return invokeAsync(decrypt, PerformanceEvents.Decrypt, this.logger, this.performanceClient, correlationId)(this.encryptionCookie.key, encObj.nonce, this.getContext(key), encObj.data);
    }
    /**
     * Helper to decrypt and save an array of cache keys
     * @param arr
     * @returns Array of keys successfully imported
     */
    async importArray(arr, correlationId) {
        const importedArr = [];
        const promiseArr = [];
        arr.forEach((key) => {
            const promise = this.getItemFromEncryptedCache(key, correlationId).then((value) => {
                if (value) {
                    this.memoryStorage.setItem(key, value);
                    importedArr.push(key);
                }
                else {
                    // If value is empty, unencrypted or expired remove
                    this.removeItem(key);
                }
            });
            promiseArr.push(promise);
        });
        await Promise.all(promiseArr);
        return importedArr;
    }
    /**
     * Gets encryption context for a given cache entry. This is clientId for app specific entries, empty string for shared entries
     * @param key
     * @returns
     */
    getContext(key) {
        let context = "";
        if (key.includes(this.clientId)) {
            context = this.clientId; // Used to bind encryption key to this appId
        }
        return context;
    }
}

export { LocalStorage };
//# sourceMappingURL=LocalStorage.mjs.map
