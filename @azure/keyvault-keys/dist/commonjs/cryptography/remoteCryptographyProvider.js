"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteCryptographyProvider = void 0;
const tslib_1 = require("tslib");
const constants_js_1 = require("../constants.js");
const index_js_1 = require("../generated/index.js");
const identifier_js_1 = require("../identifier.js");
const keysModels_js_1 = require("../keysModels.js");
const transformations_js_1 = require("../transformations.js");
const crypto_js_1 = require("./crypto.js");
const log_js_1 = require("../log.js");
const keyvault_common_1 = require("@azure/keyvault-common");
const tracing_js_1 = require("../tracing.js");
/**
 * The remote cryptography provider is used to run crypto operations against KeyVault.
 * @internal
 */
class RemoteCryptographyProvider {
    constructor(key, credential, pipelineOptions = {}) {
        var _a;
        this.client = getOrInitializeClient(credential, pipelineOptions);
        this.key = key;
        let keyId;
        if (typeof key === "string") {
            keyId = key;
        }
        else {
            keyId = key.id;
        }
        try {
            const parsed = (0, identifier_js_1.parseKeyVaultKeyIdentifier)(keyId);
            if (parsed.name === "") {
                throw new Error("Could not find 'name' of key in key URL");
            }
            if (!parsed.vaultUrl || parsed.vaultUrl === "") {
                throw new Error("Could not find 'vaultUrl' of key in key URL");
            }
            this.vaultUrl = parsed.vaultUrl;
            this.name = parsed.name;
            this.version = (_a = parsed.version) !== null && _a !== void 0 ? _a : "";
        }
        catch (err) {
            log_js_1.logger.error(err);
            throw new Error(`${keyId} is not a valid Key Vault key ID`);
        }
    }
    // The remote client supports all algorithms and all operations.
    isSupported(_algorithm, _operation) {
        return true;
    }
    encrypt(encryptParameters, options = {}) {
        const { algorithm, plaintext } = encryptParameters, params = tslib_1.__rest(encryptParameters, ["algorithm", "plaintext"]);
        const requestOptions = Object.assign(Object.assign({}, options), params);
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.encrypt", requestOptions, async (updatedOptions) => {
            const result = await this.client.encrypt(this.vaultUrl, this.name, this.version, algorithm, plaintext, updatedOptions);
            return {
                algorithm: encryptParameters.algorithm,
                result: result.result,
                keyID: this.getKeyID(),
                additionalAuthenticatedData: result.additionalAuthenticatedData,
                authenticationTag: result.authenticationTag,
                iv: result.iv,
            };
        });
    }
    decrypt(decryptParameters, options = {}) {
        const { algorithm, ciphertext } = decryptParameters, params = tslib_1.__rest(decryptParameters, ["algorithm", "ciphertext"]);
        const requestOptions = Object.assign(Object.assign({}, options), params);
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.decrypt", requestOptions, async (updatedOptions) => {
            const result = await this.client.decrypt(this.vaultUrl, this.name, this.version, algorithm, ciphertext, updatedOptions);
            return {
                result: result.result,
                keyID: this.getKeyID(),
                algorithm,
            };
        });
    }
    wrapKey(algorithm, keyToWrap, options = {}) {
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.wrapKey", options, async (updatedOptions) => {
            const result = await this.client.wrapKey(this.vaultUrl, this.name, this.version, algorithm, keyToWrap, updatedOptions);
            return {
                result: result.result,
                algorithm,
                keyID: this.getKeyID(),
            };
        });
    }
    unwrapKey(algorithm, encryptedKey, options = {}) {
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.unwrapKey", options, async (updatedOptions) => {
            const result = await this.client.unwrapKey(this.vaultUrl, this.name, this.version, algorithm, encryptedKey, updatedOptions);
            return {
                result: result.result,
                algorithm,
                keyID: this.getKeyID(),
            };
        });
    }
    sign(algorithm, digest, options = {}) {
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.sign", options, async (updatedOptions) => {
            const result = await this.client.sign(this.vaultUrl, this.name, this.version, algorithm, digest, updatedOptions);
            return { result: result.result, algorithm, keyID: this.getKeyID() };
        });
    }
    verifyData(algorithm, data, signature, options = {}) {
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.verifyData", options, async (updatedOptions) => {
            const hash = await (0, crypto_js_1.createHash)(algorithm, data);
            return this.verify(algorithm, hash, signature, updatedOptions);
        });
    }
    verify(algorithm, digest, signature, options = {}) {
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.verify", options, async (updatedOptions) => {
            const response = await this.client.verify(this.vaultUrl, this.name, this.version, algorithm, digest, signature, updatedOptions);
            return {
                result: response.value ? response.value : false,
                keyID: this.getKeyID(),
            };
        });
    }
    signData(algorithm, data, options = {}) {
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.signData", options, async (updatedOptions) => {
            const digest = await (0, crypto_js_1.createHash)(algorithm, data);
            const result = await this.client.sign(this.vaultUrl, this.name, this.version, algorithm, digest, updatedOptions);
            return { result: result.result, algorithm, keyID: this.getKeyID() };
        });
    }
    /**
     * The ID of the key used to perform cryptographic operations for the client.
     */
    get keyId() {
        return this.getKeyID();
    }
    /**
     * Gets the {@link KeyVaultKey} used for cryptography operations, fetching it
     * from KeyVault if necessary.
     * @param options - Additional options.
     */
    getKey(options = {}) {
        return tracing_js_1.tracingClient.withSpan("RemoteCryptographyProvider.getKey", options, async (updatedOptions) => {
            if (typeof this.key === "string") {
                if (!this.name || this.name === "") {
                    throw new Error("getKey requires a key with a name");
                }
                const response = await this.client.getKey(this.vaultUrl, this.name, options && options.version ? options.version : this.version ? this.version : "", updatedOptions);
                this.key = (0, transformations_js_1.getKeyFromKeyBundle)(response);
            }
            return this.key;
        });
    }
    /**
     * Attempts to retrieve the ID of the key.
     */
    getKeyID() {
        let kid;
        if (typeof this.key !== "string") {
            kid = this.key.id;
        }
        else {
            kid = this.key;
        }
        return kid;
    }
}
exports.RemoteCryptographyProvider = RemoteCryptographyProvider;
/**
 * A helper method to either get the passed down generated client or initialize a new one.
 * An already constructed generated client may be passed down from {@link KeyClient} in which case we should reuse it.
 *
 * @internal
 * @param credential - The credential to use when initializing a new client.
 * @param options - The options for constructing a client or the underlying client if one already exists.
 * @returns - A generated client instance
 */
function getOrInitializeClient(credential, options) {
    if (options.generatedClient) {
        return options.generatedClient;
    }
    const libInfo = `azsdk-js-keyvault-keys/${constants_js_1.SDK_VERSION}`;
    const userAgentOptions = options.userAgentOptions;
    options.userAgentOptions = {
        userAgentPrefix: userAgentOptions && userAgentOptions.userAgentPrefix
            ? `${userAgentOptions.userAgentPrefix} ${libInfo}`
            : libInfo,
    };
    const internalPipelineOptions = Object.assign(Object.assign({}, options), { loggingOptions: {
            logger: log_js_1.logger.info,
            allowedHeaderNames: [
                "x-ms-keyvault-region",
                "x-ms-keyvault-network-info",
                "x-ms-keyvault-service-version",
            ],
        } });
    const client = new index_js_1.KeyVaultClient(options.serviceVersion || keysModels_js_1.LATEST_API_VERSION, internalPipelineOptions);
    // The authentication policy must come after the deserialization policy since the deserialization policy
    // converts 401 responses to an Error, and we don't want to deal with that.
    client.pipeline.addPolicy((0, keyvault_common_1.keyVaultAuthenticationPolicy)(credential, options), {
        afterPolicies: ["deserializationPolicy"],
    });
    return client;
}
//# sourceMappingURL=remoteCryptographyProvider.js.map