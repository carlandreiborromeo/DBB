"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownEncryptionAlgorithms = exports.KnownSignatureAlgorithms = exports.KnownKeyCurveNames = void 0;
const index_js_1 = require("./generated/models/index.js");
Object.defineProperty(exports, "KnownKeyCurveNames", { enumerable: true, get: function () { return index_js_1.KnownJsonWebKeyCurveName; } });
Object.defineProperty(exports, "KnownSignatureAlgorithms", { enumerable: true, get: function () { return index_js_1.KnownJsonWebKeySignatureAlgorithm; } });
/** Known values of {@link EncryptionAlgorithm} that the service accepts. */
var KnownEncryptionAlgorithms;
(function (KnownEncryptionAlgorithms) {
    /** Encryption Algorithm - RSA-OAEP */
    KnownEncryptionAlgorithms["RSAOaep"] = "RSA-OAEP";
    /** Encryption Algorithm - RSA-OAEP-256 */
    KnownEncryptionAlgorithms["RSAOaep256"] = "RSA-OAEP-256";
    /** Encryption Algorithm - RSA1_5 */
    KnownEncryptionAlgorithms["RSA15"] = "RSA1_5";
    /** Encryption Algorithm - A128GCM */
    KnownEncryptionAlgorithms["A128GCM"] = "A128GCM";
    /** Encryption Algorithm - A192GCM */
    KnownEncryptionAlgorithms["A192GCM"] = "A192GCM";
    /** Encryption Algorithm - A256GCM */
    KnownEncryptionAlgorithms["A256GCM"] = "A256GCM";
    /** Encryption Algorithm - A128KW */
    KnownEncryptionAlgorithms["A128KW"] = "A128KW";
    /** Encryption Algorithm - A192KW */
    KnownEncryptionAlgorithms["A192KW"] = "A192KW";
    /** Encryption Algorithm - A256KW */
    KnownEncryptionAlgorithms["A256KW"] = "A256KW";
    /** Encryption Algorithm - A128CBC */
    KnownEncryptionAlgorithms["A128CBC"] = "A128CBC";
    /** Encryption Algorithm - A192CBC */
    KnownEncryptionAlgorithms["A192CBC"] = "A192CBC";
    /** Encryption Algorithm - A256CBC */
    KnownEncryptionAlgorithms["A256CBC"] = "A256CBC";
    /** Encryption Algorithm - A128CBCPAD */
    KnownEncryptionAlgorithms["A128Cbcpad"] = "A128CBCPAD";
    /** Encryption Algorithm - A192CBCPAD */
    KnownEncryptionAlgorithms["A192Cbcpad"] = "A192CBCPAD";
    /** Encryption Algorithm - A256CBCPAD */
    KnownEncryptionAlgorithms["A256Cbcpad"] = "A256CBCPAD";
})(KnownEncryptionAlgorithms || (exports.KnownEncryptionAlgorithms = KnownEncryptionAlgorithms = {}));
//# sourceMappingURL=cryptographyClientModels.js.map