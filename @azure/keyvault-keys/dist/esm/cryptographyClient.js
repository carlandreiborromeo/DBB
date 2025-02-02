// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { KnownKeyOperations, } from "./keysModels.js";
import { RemoteCryptographyProvider } from "./cryptography/remoteCryptographyProvider.js";
import { randomBytes } from "./cryptography/crypto.js";
import { RsaCryptographyProvider } from "./cryptography/rsaCryptographyProvider.js";
import { AesCryptographyProvider } from "./cryptography/aesCryptographyProvider.js";
import { tracingClient } from "./tracing.js";
import { isRestError } from "@azure/core-rest-pipeline";
import { logger } from "./log.js";
/**
 * A client used to perform cryptographic operations on an Azure Key vault key
 * or a local {@link JsonWebKey}.
 */
export class CryptographyClient {
    /**
     * Internal constructor implementation for either local or Key Vault backed keys.
     * @param key - The key to use during cryptography tasks.
     * @param credential - Teh credential to use when constructing a Key Vault Cryptography client.
     */
    constructor(key, credential, pipelineOptions = {}) {
        if (typeof key === "string") {
            // Key URL for remote-local operations.
            this.key = {
                kind: "identifier",
                value: key,
            };
            this.remoteProvider = new RemoteCryptographyProvider(key, credential, pipelineOptions);
        }
        else if ("name" in key) {
            // KeyVault key for remote-local operations.
            this.key = {
                kind: "KeyVaultKey",
                value: key,
            };
            this.remoteProvider = new RemoteCryptographyProvider(key, credential, pipelineOptions);
        }
        else {
            // JsonWebKey for local-only operations.
            this.key = {
                kind: "JsonWebKey",
                value: key,
            };
        }
    }
    /**
     * The base URL to the vault. If a local {@link JsonWebKey} is used vaultUrl will be empty.
     */
    get vaultUrl() {
        var _a;
        return ((_a = this.remoteProvider) === null || _a === void 0 ? void 0 : _a.vaultUrl) || "";
    }
    /**
     * The ID of the key used to perform cryptographic operations for the client.
     */
    get keyID() {
        if (this.key.kind === "identifier" || this.key.kind === "remoteOnlyIdentifier") {
            return this.key.value;
        }
        else if (this.key.kind === "KeyVaultKey") {
            return this.key.value.id;
        }
        else {
            return this.key.value.kid;
        }
    }
    encrypt(...args) {
        const [parameters, options] = this.disambiguateEncryptArguments(args);
        return tracingClient.withSpan("CryptographyClient.encrypt", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.Encrypt);
            this.initializeIV(parameters);
            const provider = await this.getProvider("encrypt", parameters.algorithm, updatedOptions);
            try {
                return provider.encrypt(parameters, updatedOptions);
            }
            catch (error) {
                if (this.remoteProvider) {
                    return this.remoteProvider.encrypt(parameters, updatedOptions);
                }
                throw error;
            }
        });
    }
    initializeIV(parameters) {
        // For AES-GCM the service **must** generate the IV, so we only populate it for AES-CBC
        const algorithmsRequiringIV = [
            "A128CBC",
            "A128CBCPAD",
            "A192CBC",
            "A192CBCPAD",
            "A256CBC",
            "A256CBCPAD",
        ];
        if (parameters.algorithm in algorithmsRequiringIV) {
            try {
                const cbcParams = parameters;
                if (!cbcParams.iv) {
                    cbcParams.iv = randomBytes(16);
                }
            }
            catch (e) {
                throw new Error(`Unable to initialize IV for algorithm ${parameters.algorithm}. You may pass a valid IV to avoid this error. Error: ${e.message}`);
            }
        }
    }
    /**
     * Standardizes the arguments of multiple overloads into a single shape.
     * @param args - The encrypt arguments
     */
    disambiguateEncryptArguments(args) {
        if (typeof args[0] === "string") {
            // Sample shape: ["RSA1_5", buffer, options]
            return [
                {
                    algorithm: args[0],
                    plaintext: args[1],
                },
                args[2] || {},
            ];
        }
        else {
            // Sample shape: [{ algorithm: "RSA1_5", plaintext: buffer }, options]
            return [args[0], (args[1] || {})];
        }
    }
    decrypt(...args) {
        const [parameters, options] = this.disambiguateDecryptArguments(args);
        return tracingClient.withSpan("CryptographyClient.decrypt", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.Decrypt);
            const provider = await this.getProvider("decrypt", parameters.algorithm, updatedOptions);
            try {
                return provider.decrypt(parameters, updatedOptions);
            }
            catch (error) {
                if (this.remoteProvider) {
                    return this.remoteProvider.decrypt(parameters, updatedOptions);
                }
                throw error;
            }
        });
    }
    /**
     * Standardizes the arguments of multiple overloads into a single shape.
     * @param args - The decrypt arguments
     */
    disambiguateDecryptArguments(args) {
        if (typeof args[0] === "string") {
            // Sample shape: ["RSA1_5", encryptedBuffer, options]
            return [
                {
                    algorithm: args[0],
                    ciphertext: args[1],
                },
                args[2] || {},
            ];
        }
        else {
            // Sample shape: [{ algorithm: "RSA1_5", ciphertext: encryptedBuffer }, options]
            return [args[0], (args[1] || {})];
        }
    }
    /**
     * Wraps the given key using the specified cryptography algorithm
     *
     * Example usage:
     * ```ts
     * let client = new CryptographyClient(keyVaultKey, credentials);
     * let result = await client.wrapKey("RSA1_5", keyToWrap);
     * ```
     * @param algorithm - The encryption algorithm to use to wrap the given key.
     * @param key - The key to wrap.
     * @param options - Additional options.
     */
    wrapKey(algorithm, key, options = {}) {
        return tracingClient.withSpan("CryptographyClient.wrapKey", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.WrapKey);
            const provider = await this.getProvider("wrapKey", algorithm, updatedOptions);
            try {
                return provider.wrapKey(algorithm, key, updatedOptions);
            }
            catch (err) {
                if (this.remoteProvider) {
                    return this.remoteProvider.wrapKey(algorithm, key, options);
                }
                throw err;
            }
        });
    }
    /**
     * Unwraps the given wrapped key using the specified cryptography algorithm
     *
     * Example usage:
     * ```ts
     * let client = new CryptographyClient(keyVaultKey, credentials);
     * let result = await client.unwrapKey("RSA1_5", keyToUnwrap);
     * ```
     * @param algorithm - The decryption algorithm to use to unwrap the key.
     * @param encryptedKey - The encrypted key to unwrap.
     * @param options - Additional options.
     */
    unwrapKey(algorithm, encryptedKey, options = {}) {
        return tracingClient.withSpan("CryptographyClient.unwrapKey", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.UnwrapKey);
            const provider = await this.getProvider("unwrapKey", algorithm, updatedOptions);
            try {
                return provider.unwrapKey(algorithm, encryptedKey, updatedOptions);
            }
            catch (err) {
                if (this.remoteProvider) {
                    return this.remoteProvider.unwrapKey(algorithm, encryptedKey, options);
                }
                throw err;
            }
        });
    }
    /**
     * Cryptographically sign the digest of a message
     *
     * Example usage:
     * ```ts
     * let client = new CryptographyClient(keyVaultKey, credentials);
     * let result = await client.sign("RS256", digest);
     * ```
     * @param algorithm - The signing algorithm to use.
     * @param digest - The digest of the data to sign.
     * @param options - Additional options.
     */
    sign(algorithm, digest, options = {}) {
        return tracingClient.withSpan("CryptographyClient.sign", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.Sign);
            const provider = await this.getProvider("sign", algorithm, updatedOptions);
            try {
                return provider.sign(algorithm, digest, updatedOptions);
            }
            catch (err) {
                if (this.remoteProvider) {
                    return this.remoteProvider.sign(algorithm, digest, updatedOptions);
                }
                throw err;
            }
        });
    }
    /**
     * Verify the signed message digest
     *
     * Example usage:
     * ```ts
     * let client = new CryptographyClient(keyVaultKey, credentials);
     * let result = await client.verify("RS256", signedDigest, signature);
     * ```
     * @param algorithm - The signing algorithm to use to verify with.
     * @param digest - The digest to verify.
     * @param signature - The signature to verify the digest against.
     * @param options - Additional options.
     */
    verify(algorithm, digest, signature, options = {}) {
        return tracingClient.withSpan("CryptographyClient.verify", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.Verify);
            const provider = await this.getProvider("verify", algorithm, updatedOptions);
            try {
                return provider.verify(algorithm, digest, signature, updatedOptions);
            }
            catch (err) {
                if (this.remoteProvider) {
                    return this.remoteProvider.verify(algorithm, digest, signature, updatedOptions);
                }
                throw err;
            }
        });
    }
    /**
     * Cryptographically sign a block of data
     *
     * Example usage:
     * ```ts
     * let client = new CryptographyClient(keyVaultKey, credentials);
     * let result = await client.signData("RS256", message);
     * ```
     * @param algorithm - The signing algorithm to use.
     * @param data - The data to sign.
     * @param options - Additional options.
     */
    signData(algorithm, data, 
    // eslint-disable-next-line @azure/azure-sdk/ts-naming-options
    options = {}) {
        return tracingClient.withSpan("CryptographyClient.signData", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.Sign);
            const provider = await this.getProvider("signData", algorithm, updatedOptions);
            try {
                return provider.signData(algorithm, data, updatedOptions);
            }
            catch (err) {
                if (this.remoteProvider) {
                    return this.remoteProvider.signData(algorithm, data, options);
                }
                throw err;
            }
        });
    }
    /**
     * Verify the signed block of data
     *
     * Example usage:
     * ```ts
     * let client = new CryptographyClient(keyVaultKey, credentials);
     * let result = await client.verifyData("RS256", signedMessage, signature);
     * ```
     * @param algorithm - The algorithm to use to verify with.
     * @param data - The signed block of data to verify.
     * @param signature - The signature to verify the block against.
     * @param options - Additional options.
     */
    verifyData(algorithm, data, signature, 
    // eslint-disable-next-line @azure/azure-sdk/ts-naming-options
    options = {}) {
        return tracingClient.withSpan("CryptographyClient.verifyData", options, async (updatedOptions) => {
            this.ensureValid(await this.fetchKey(updatedOptions), KnownKeyOperations.Verify);
            const provider = await this.getProvider("verifyData", algorithm, updatedOptions);
            try {
                return provider.verifyData(algorithm, data, signature, updatedOptions);
            }
            catch (err) {
                if (this.remoteProvider) {
                    return this.remoteProvider.verifyData(algorithm, data, signature, updatedOptions);
                }
                throw err;
            }
        });
    }
    /**
     * Retrieves the {@link JsonWebKey} from the Key Vault, if possible. Returns undefined if the key could not be retrieved due to insufficient permissions.
     *
     * Example usage:
     * ```ts
     * let client = new CryptographyClient(keyVaultKey, credentials);
     * let result = await client.getKeyMaterial();
     * ```
     */
    async getKeyMaterial(options) {
        const key = await this.fetchKey(options);
        switch (key.kind) {
            case "JsonWebKey":
                return key.value;
            case "KeyVaultKey":
                return key.value.key;
            default:
                return undefined;
        }
    }
    /**
     * Returns the underlying key used for cryptographic operations.
     * If needed, attempts to fetch the key from KeyVault and exchanges the ID for the actual key.
     * @param options - The additional options.
     */
    async fetchKey(options) {
        if (this.key.kind === "identifier") {
            // Exchange the identifier with the actual key when needed
            let key;
            try {
                key = await this.remoteProvider.getKey(options);
            }
            catch (e) {
                if (isRestError(e) && e.statusCode === 403) {
                    // If we don't have permission to get the key, we'll fall back to using the remote provider.
                    // Marking the key as a remoteOnlyIdentifier will ensure that we don't attempt to fetch the key again.
                    logger.verbose(`Permission denied to get key ${this.key.value}. Falling back to remote operation.`);
                    this.key = { kind: "remoteOnlyIdentifier", value: this.key.value };
                }
                else {
                    throw e;
                }
            }
            if (key) {
                this.key = { kind: "KeyVaultKey", value: key };
            }
        }
        return this.key;
    }
    /**
     * Gets the provider that support this algorithm and operation.
     * The available providers are ordered by priority such that the first provider that supports this
     * operation is the one we should use.
     * @param operation - The {@link KeyOperation}.
     * @param algorithm - The algorithm to use.
     */
    async getProvider(operation, algorithm, options) {
        if (!this.providers) {
            const keyMaterial = await this.getKeyMaterial(options);
            this.providers = [];
            // Add local crypto providers as needed
            if (keyMaterial) {
                this.providers.push(new RsaCryptographyProvider(keyMaterial), new AesCryptographyProvider(keyMaterial));
            }
            // If the remote provider exists, we're in hybrid-mode. Otherwise we're in local-only mode.
            // If we're in hybrid mode the remote provider is used as a catch-all and should be last in the list.
            if (this.remoteProvider) {
                this.providers.push(this.remoteProvider);
            }
        }
        const providers = this.providers.filter((p) => p.isSupported(algorithm, operation));
        if (providers.length === 0) {
            throw new Error(`Unable to support operation: "${operation}" with algorithm: "${algorithm}" ${this.key.kind === "JsonWebKey" ? "using a local JsonWebKey" : ""}`);
        }
        // Return the first provider that supports this request
        return providers[0];
    }
    ensureValid(key, operation) {
        var _a;
        if (key.kind === "KeyVaultKey") {
            const keyOps = key.value.keyOperations;
            const { notBefore, expiresOn } = key.value.properties;
            const now = new Date();
            // Check KeyVault Key Expiration
            if (notBefore && now < notBefore) {
                throw new Error(`Key ${key.value.id} can't be used before ${notBefore.toISOString()}`);
            }
            if (expiresOn && now > expiresOn) {
                throw new Error(`Key ${key.value.id} expired at ${expiresOn.toISOString()}`);
            }
            // Check Key operations
            if (operation && keyOps && !(keyOps === null || keyOps === void 0 ? void 0 : keyOps.includes(operation))) {
                throw new Error(`Operation ${operation} is not supported on key ${key.value.id}`);
            }
        }
        else if (key.kind === "JsonWebKey") {
            // Check JsonWebKey Key operations
            if (operation && key.value.keyOps && !((_a = key.value.keyOps) === null || _a === void 0 ? void 0 : _a.includes(operation))) {
                throw new Error(`Operation ${operation} is not supported on key ${key.value.kid}`);
            }
        }
    }
}
//# sourceMappingURL=cryptographyClient.js.map