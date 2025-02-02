/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { CryptoOps } from './CryptoOps.mjs';
import { Logger, PopTokenGenerator } from '@azure/msal-common/browser';
import { name, version } from '../packageMetadata.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class SignedHttpRequest {
    constructor(shrParameters, shrOptions) {
        const loggerOptions = (shrOptions && shrOptions.loggerOptions) || {};
        this.logger = new Logger(loggerOptions, name, version);
        this.cryptoOps = new CryptoOps(this.logger);
        this.popTokenGenerator = new PopTokenGenerator(this.cryptoOps);
        this.shrParameters = shrParameters;
    }
    /**
     * Generates and caches a keypair for the given request options.
     * @returns Public key digest, which should be sent to the token issuer.
     */
    async generatePublicKeyThumbprint() {
        const { kid } = await this.popTokenGenerator.generateKid(this.shrParameters);
        return kid;
    }
    /**
     * Generates a signed http request for the given payload with the given key.
     * @param payload Payload to sign (e.g. access token)
     * @param publicKeyThumbprint Public key digest (from generatePublicKeyThumbprint API)
     * @param claims Additional claims to include/override in the signed JWT
     * @returns Pop token signed with the corresponding private key
     */
    async signRequest(payload, publicKeyThumbprint, claims) {
        return this.popTokenGenerator.signPayload(payload, publicKeyThumbprint, this.shrParameters, claims);
    }
    /**
     * Removes cached keys from browser for given public key thumbprint
     * @param publicKeyThumbprint Public key digest (from generatePublicKeyThumbprint API)
     * @returns If keys are properly deleted
     */
    async removeKeys(publicKeyThumbprint) {
        return this.cryptoOps.removeTokenBindingKey(publicKeyThumbprint);
    }
}

export { SignedHttpRequest };
//# sourceMappingURL=SignedHttpRequest.mjs.map
