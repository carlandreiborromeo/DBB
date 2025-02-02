"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyRotationTransformations = void 0;
exports.getKeyFromKeyBundle = getKeyFromKeyBundle;
exports.getDeletedKeyFromDeletedKeyItem = getDeletedKeyFromDeletedKeyItem;
exports.getKeyPropertiesFromKeyItem = getKeyPropertiesFromKeyItem;
const identifier_js_1 = require("./identifier.js");
/**
 * @internal
 * Shapes the exposed {@link KeyVaultKey} based on either a received key bundle or deleted key bundle.
 */
function getKeyFromKeyBundle(bundle) {
    const keyBundle = bundle;
    const deletedKeyBundle = bundle;
    const parsedId = (0, identifier_js_1.parseKeyVaultKeyIdentifier)(keyBundle.key.kid);
    const attributes = keyBundle.attributes || {};
    delete keyBundle.attributes;
    const resultObject = {
        key: keyBundle.key,
        id: keyBundle.key ? keyBundle.key.kid : undefined,
        name: parsedId.name,
        keyOperations: keyBundle.key ? keyBundle.key.keyOps : undefined,
        keyType: keyBundle.key ? keyBundle.key.kty : undefined,
        properties: {
            tags: keyBundle.tags,
            enabled: attributes.enabled,
            notBefore: attributes.notBefore,
            expiresOn: attributes.expires,
            createdOn: attributes.created,
            updatedOn: attributes.updated,
            recoverableDays: attributes.recoverableDays,
            recoveryLevel: attributes.recoveryLevel,
            exportable: attributes.exportable,
            releasePolicy: keyBundle.releasePolicy,
            hsmPlatform: attributes.hsmPlatform,
            vaultUrl: parsedId.vaultUrl,
            version: parsedId.version,
            name: parsedId.name,
            managed: keyBundle.managed,
            id: keyBundle.key ? keyBundle.key.kid : undefined,
        },
    };
    if (deletedKeyBundle.recoveryId) {
        resultObject.properties.recoveryId = deletedKeyBundle.recoveryId;
        resultObject.properties.scheduledPurgeDate = deletedKeyBundle.scheduledPurgeDate;
        resultObject.properties.deletedOn = deletedKeyBundle.deletedDate;
    }
    return resultObject;
}
/**
 * @internal
 * Shapes the exposed {@link DeletedKey} based on a received KeyItem.
 */
function getDeletedKeyFromDeletedKeyItem(keyItem) {
    const commonProperties = getKeyPropertiesFromKeyItem(keyItem);
    return {
        key: {
            kid: keyItem.kid,
        },
        id: keyItem.kid,
        name: commonProperties.name,
        properties: Object.assign(Object.assign({}, commonProperties), { recoveryId: keyItem.recoveryId, scheduledPurgeDate: keyItem.scheduledPurgeDate, deletedOn: keyItem.deletedDate }),
    };
}
/**
 * @internal
 * Shapes the exposed {@link KeyProperties} based on a received KeyItem.
 */
function getKeyPropertiesFromKeyItem(keyItem) {
    const parsedId = (0, identifier_js_1.parseKeyVaultKeyIdentifier)(keyItem.kid);
    const attributes = keyItem.attributes || {};
    const resultObject = {
        createdOn: attributes.created,
        enabled: attributes === null || attributes === void 0 ? void 0 : attributes.enabled,
        expiresOn: attributes === null || attributes === void 0 ? void 0 : attributes.expires,
        id: keyItem.kid,
        managed: keyItem.managed,
        name: parsedId.name,
        notBefore: attributes === null || attributes === void 0 ? void 0 : attributes.notBefore,
        recoverableDays: attributes === null || attributes === void 0 ? void 0 : attributes.recoverableDays,
        recoveryLevel: attributes === null || attributes === void 0 ? void 0 : attributes.recoveryLevel,
        hsmPlatform: attributes === null || attributes === void 0 ? void 0 : attributes.hsmPlatform,
        tags: keyItem.tags,
        updatedOn: attributes.updated,
        vaultUrl: parsedId.vaultUrl,
        version: parsedId.version,
    };
    return resultObject;
}
const actionTypeCaseInsensitiveMapping = {
    rotate: "Rotate",
    notify: "Notify",
};
function getNormalizedActionType(caseInsensitiveActionType) {
    const result = actionTypeCaseInsensitiveMapping[caseInsensitiveActionType.toLowerCase()];
    if (result) {
        return result;
    }
    throw new Error(`Unrecognized action type: ${caseInsensitiveActionType}`);
}
/**
 * @internal
 */
exports.keyRotationTransformations = {
    propertiesToGenerated: function (parameters) {
        var _a;
        const policy = {
            attributes: {
                expiryTime: parameters.expiresIn,
            },
            lifetimeActions: (_a = parameters.lifetimeActions) === null || _a === void 0 ? void 0 : _a.map((action) => {
                const generatedAction = {
                    action: { type: action.action },
                    trigger: {},
                };
                if (action.timeAfterCreate) {
                    generatedAction.trigger.timeAfterCreate = action.timeAfterCreate;
                }
                if (action.timeBeforeExpiry) {
                    generatedAction.trigger.timeBeforeExpiry = action.timeBeforeExpiry;
                }
                return generatedAction;
            }),
        };
        return policy;
    },
    generatedToPublic(generated) {
        var _a, _b, _c, _d;
        const policy = {
            id: generated.id,
            createdOn: (_a = generated.attributes) === null || _a === void 0 ? void 0 : _a.created,
            updatedOn: (_b = generated.attributes) === null || _b === void 0 ? void 0 : _b.updated,
            expiresIn: (_c = generated.attributes) === null || _c === void 0 ? void 0 : _c.expiryTime,
            lifetimeActions: (_d = generated.lifetimeActions) === null || _d === void 0 ? void 0 : _d.map((action) => {
                var _a, _b;
                return {
                    action: getNormalizedActionType(action.action.type),
                    timeAfterCreate: (_a = action.trigger) === null || _a === void 0 ? void 0 : _a.timeAfterCreate,
                    timeBeforeExpiry: (_b = action.trigger) === null || _b === void 0 ? void 0 : _b.timeBeforeExpiry,
                };
            }),
        };
        return policy;
    },
};
//# sourceMappingURL=transformations.js.map