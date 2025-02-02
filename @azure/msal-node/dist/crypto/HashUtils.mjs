/*! @azure/msal-node v2.16.2 2024-11-19 */
'use strict';
import { Hash } from '../utils/Constants.mjs';
import crypto from 'crypto';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class HashUtils {
    /**
     * generate 'SHA256' hash
     * @param buffer
     */
    sha256(buffer) {
        return crypto.createHash(Hash.SHA256).update(buffer).digest();
    }
}

export { HashUtils };
//# sourceMappingURL=HashUtils.mjs.map
