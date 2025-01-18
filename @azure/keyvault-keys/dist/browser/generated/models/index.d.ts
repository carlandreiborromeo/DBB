import * as coreClient from "@azure/core-client";
import * as coreHttpCompat from "@azure/core-http-compat";
/** The key create parameters. */
export interface KeyCreateParameters {
    /** The type of key to create. For valid values, see JsonWebKeyType. */
    kty: JsonWebKeyType;
    /** The key size in bits. For example: 2048, 3072, or 4096 for RSA. */
    keySize?: number;
    /** The public exponent for a RSA key. */
    publicExponent?: number;
    keyOps?: JsonWebKeyOperation[];
    /** The attributes of a key managed by the key vault service. */
    keyAttributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /** Elliptic curve name. For valid values, see JsonWebKeyCurveName. */
    curve?: JsonWebKeyCurveName;
    /** The policy rules under which the key can be exported. */
    releasePolicy?: KeyReleasePolicy;
}
/** The object attributes managed by the KeyVault service. */
export interface Attributes {
    /** Determines whether the object is enabled. */
    enabled?: boolean;
    /** Not before date in UTC. */
    notBefore?: Date;
    /** Expiry date in UTC. */
    expires?: Date;
    /**
     * Creation time in UTC.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly created?: Date;
    /**
     * Last updated time in UTC.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly updated?: Date;
}
/** The policy rules under which the key can be exported. */
export interface KeyReleasePolicy {
    /** Content type and version of key release policy */
    contentType?: string;
    /** Defines the mutability state of the policy. Once marked immutable, this flag cannot be reset and the policy cannot be changed under any circumstances. */
    immutable?: boolean;
    /** Blob encoding the policy rules under which the key can be released. Blob must be base64 URL encoded. */
    encodedPolicy?: Uint8Array;
}
/** A KeyBundle consisting of a WebKey plus its attributes. */
export interface KeyBundle {
    /** The Json web key. */
    key?: JsonWebKey;
    /** The key management attributes. */
    attributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /**
     * True if the key's lifetime is managed by key vault. If this is a key backing a certificate, then managed will be true.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly managed?: boolean;
    /** The policy rules under which the key can be exported. */
    releasePolicy?: KeyReleasePolicy;
}
/** As of http://tools.ietf.org/html/draft-ietf-jose-json-web-key-18 */
export interface JsonWebKey {
    /** Key identifier. */
    kid?: string;
    /** JsonWebKey Key Type (kty), as defined in https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40. */
    kty?: JsonWebKeyType;
    keyOps?: string[];
    /** RSA modulus. */
    n?: Uint8Array;
    /** RSA public exponent. */
    e?: Uint8Array;
    /** RSA private exponent, or the D component of an EC private key. */
    d?: Uint8Array;
    /** RSA private key parameter. */
    dp?: Uint8Array;
    /** RSA private key parameter. */
    dq?: Uint8Array;
    /** RSA private key parameter. */
    qi?: Uint8Array;
    /** RSA secret prime. */
    p?: Uint8Array;
    /** RSA secret prime, with p < q. */
    q?: Uint8Array;
    /** Symmetric key. */
    k?: Uint8Array;
    /** Protected Key, used with 'Bring Your Own Key'. */
    t?: Uint8Array;
    /** Elliptic curve name. For valid values, see JsonWebKeyCurveName. */
    crv?: JsonWebKeyCurveName;
    /** X component of an EC public key. */
    x?: Uint8Array;
    /** Y component of an EC public key. */
    y?: Uint8Array;
}
/** The key vault error exception. */
export interface KeyVaultError {
    /**
     * The key vault server error.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly error?: ErrorModel;
}
/** The key vault server error. */
export interface ErrorModel {
    /**
     * The error code.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly code?: string;
    /**
     * The error message.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly message?: string;
    /**
     * The key vault server error.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly innerError?: ErrorModel;
}
/** The key import parameters. */
export interface KeyImportParameters {
    /** Whether to import as a hardware key (HSM) or software key. */
    hsm?: boolean;
    /** The Json web key */
    key: JsonWebKey;
    /** The key management attributes. */
    keyAttributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /** The policy rules under which the key can be exported. */
    releasePolicy?: KeyReleasePolicy;
}
/** The key update parameters. */
export interface KeyUpdateParameters {
    /** Json web key operations. For more information on possible key operations, see JsonWebKeyOperation. */
    keyOps?: JsonWebKeyOperation[];
    /** The attributes of a key managed by the key vault service. */
    keyAttributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /** The policy rules under which the key can be exported. */
    releasePolicy?: KeyReleasePolicy;
}
/** The key list result. */
export interface KeyListResult {
    /**
     * A response message containing a list of keys in the key vault along with a link to the next page of keys.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly value?: KeyItem[];
    /**
     * The URL to get the next set of keys.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly nextLink?: string;
}
/** The key item containing key metadata. */
export interface KeyItem {
    /** Key identifier. */
    kid?: string;
    /** The key management attributes. */
    attributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /**
     * True if the key's lifetime is managed by key vault. If this is a key backing a certificate, then managed will be true.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly managed?: boolean;
}
/** The backup key result, containing the backup blob. */
export interface BackupKeyResult {
    /**
     * The backup blob containing the backed up key.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly value?: Uint8Array;
}
/** The key restore parameters. */
export interface KeyRestoreParameters {
    /** The backup blob associated with a key bundle. */
    keyBundleBackup: Uint8Array;
}
/** The key operations parameters. */
export interface KeyOperationsParameters {
    /** algorithm identifier */
    algorithm: JsonWebKeyEncryptionAlgorithm;
    value: Uint8Array;
    /** Cryptographically random, non-repeating initialization vector for symmetric algorithms. */
    iv?: Uint8Array;
    /** Additional data to authenticate but not encrypt/decrypt when using authenticated crypto algorithms. */
    additionalAuthenticatedData?: Uint8Array;
    /** The tag to authenticate when performing decryption with an authenticated algorithm. */
    authenticationTag?: Uint8Array;
}
/** The key operation result. */
export interface KeyOperationResult {
    /**
     * Key identifier
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly kid?: string;
    /** NOTE: This property will not be serialized. It can only be populated by the server. */
    readonly result?: Uint8Array;
    /** NOTE: This property will not be serialized. It can only be populated by the server. */
    readonly iv?: Uint8Array;
    /** NOTE: This property will not be serialized. It can only be populated by the server. */
    readonly authenticationTag?: Uint8Array;
    /** NOTE: This property will not be serialized. It can only be populated by the server. */
    readonly additionalAuthenticatedData?: Uint8Array;
}
/** The key operations parameters. */
export interface KeySignParameters {
    /** The signing/verification algorithm identifier. For more information on possible algorithm types, see JsonWebKeySignatureAlgorithm. */
    algorithm: JsonWebKeySignatureAlgorithm;
    value: Uint8Array;
}
/** The key verify parameters. */
export interface KeyVerifyParameters {
    /** The signing/verification algorithm. For more information on possible algorithm types, see JsonWebKeySignatureAlgorithm. */
    algorithm: JsonWebKeySignatureAlgorithm;
    /** The digest used for signing. */
    digest: Uint8Array;
    /** The signature to be verified. */
    signature: Uint8Array;
}
/** The key verify result. */
export interface KeyVerifyResult {
    /**
     * True if the signature is verified, otherwise false.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly value?: boolean;
}
/** The release key parameters. */
export interface KeyReleaseParameters {
    /** The attestation assertion for the target of the key release. */
    targetAttestationToken: string;
    /** A client provided nonce for freshness. */
    nonce?: string;
    /** The encryption algorithm to use to protected the exported key material */
    enc?: KeyEncryptionAlgorithm;
}
/** The release result, containing the released key. */
export interface KeyReleaseResult {
    /**
     * A signed object containing the released key.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly value?: string;
}
/** A list of keys that have been deleted in this vault. */
export interface DeletedKeyListResult {
    /**
     * A response message containing a list of deleted keys in the vault along with a link to the next page of deleted keys
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly value?: DeletedKeyItem[];
    /**
     * The URL to get the next set of deleted keys.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly nextLink?: string;
}
/** Management policy for a key. */
export interface KeyRotationPolicy {
    /**
     * The key policy id.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly id?: string;
    /** Actions that will be performed by Key Vault over the lifetime of a key. For preview, lifetimeActions can only have two items at maximum: one for rotate, one for notify. Notification time would be default to 30 days before expiry and it is not configurable. */
    lifetimeActions?: LifetimeActions[];
    /** The key rotation policy attributes. */
    attributes?: KeyRotationPolicyAttributes;
}
/** Action and its trigger that will be performed by Key Vault over the lifetime of a key. */
export interface LifetimeActions {
    /** The condition that will execute the action. */
    trigger?: LifetimeActionsTrigger;
    /** The action that will be executed. */
    action?: LifetimeActionsType;
}
/** A condition to be satisfied for an action to be executed. */
export interface LifetimeActionsTrigger {
    /** Time after creation to attempt to rotate. It only applies to rotate. It will be in ISO 8601 duration format. Example: 90 days : "P90D"  */
    timeAfterCreate?: string;
    /** Time before expiry to attempt to rotate or notify. It will be in ISO 8601 duration format. Example: 90 days : "P90D" */
    timeBeforeExpiry?: string;
}
/** The action that will be executed. */
export interface LifetimeActionsType {
    /** The type of the action. The value should be compared case-insensitively. */
    type?: ActionType;
}
/** The key rotation policy attributes. */
export interface KeyRotationPolicyAttributes {
    /** The expiryTime will be applied on the new key version. It should be at least 28 days. It will be in ISO 8601 Format. Examples: 90 days: P90D, 3 months: P3M, 48 hours: PT48H, 1 year and 10 days: P1Y10D */
    expiryTime?: string;
    /**
     * The key rotation policy created time in UTC.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly created?: Date;
    /**
     * The key rotation policy's last updated time in UTC.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly updated?: Date;
}
/** The get random bytes request object. */
export interface GetRandomBytesRequest {
    /** The requested number of random bytes. */
    count: number;
}
/** The get random bytes response object containing the bytes. */
export interface RandomBytes {
    /** The bytes encoded as a base64url string. */
    value: Uint8Array;
}
/** Properties of the key pair backing a certificate. */
export interface KeyProperties {
    /** Indicates if the private key can be exported. Release policy must be provided when creating the first version of an exportable key. */
    exportable?: boolean;
    /** The type of key pair to be used for the certificate. */
    keyType?: JsonWebKeyType;
    /** The key size in bits. For example: 2048, 3072, or 4096 for RSA. */
    keySize?: number;
    /** Indicates if the same key pair will be used on certificate renewal. */
    reuseKey?: boolean;
    /** Elliptic curve name. For valid values, see JsonWebKeyCurveName. */
    curve?: JsonWebKeyCurveName;
}
/** The export key parameters. */
export interface KeyExportParameters {
    /** The export key encryption Json web key. This key MUST be a RSA key that supports encryption. */
    wrappingKey?: JsonWebKey;
    /** The export key encryption key identifier. This key MUST be a RSA key that supports encryption. */
    wrappingKid?: string;
    /** The encryption algorithm to use to protected the exported key material */
    enc?: KeyEncryptionAlgorithm;
}
/** The attributes of a key managed by the key vault service. */
export type KeyAttributes = Attributes & {
    /**
     * softDelete data retention days. Value should be >=7 and <=90 when softDelete enabled, otherwise 0.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly recoverableDays?: number;
    /**
     * Reflects the deletion recovery level currently in effect for keys in the current vault. If it contains 'Purgeable' the key can be permanently deleted by a privileged user; otherwise, only the system can purge the key, at the end of the retention interval.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly recoveryLevel?: DeletionRecoveryLevel;
    /** Indicates if the private key can be exported. Release policy must be provided when creating the first version of an exportable key. */
    exportable?: boolean;
    /**
     * The underlying HSM Platform.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly hsmPlatform?: string;
};
/** A DeletedKeyBundle consisting of a WebKey plus its Attributes and deletion info */
export type DeletedKeyBundle = KeyBundle & {
    /** The url of the recovery object, used to identify and recover the deleted key. */
    recoveryId?: string;
    /**
     * The time when the key is scheduled to be purged, in UTC
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly scheduledPurgeDate?: Date;
    /**
     * The time when the key was deleted, in UTC
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly deletedDate?: Date;
};
/** The deleted key item containing the deleted key metadata and information about deletion. */
export type DeletedKeyItem = KeyItem & {
    /** The url of the recovery object, used to identify and recover the deleted key. */
    recoveryId?: string;
    /**
     * The time when the key is scheduled to be purged, in UTC
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly scheduledPurgeDate?: Date;
    /**
     * The time when the key was deleted, in UTC
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly deletedDate?: Date;
};
/** Known values of {@link ApiVersion75} that the service accepts. */
export declare enum KnownApiVersion75 {
    /** Api Version '7.5' */
    Seven5 = "7.5"
}
/**
 * Defines values for ApiVersion75. \
 * {@link KnownApiVersion75} can be used interchangeably with ApiVersion75,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **7.5**: Api Version '7.5'
 */
export type ApiVersion75 = string;
/** Known values of {@link JsonWebKeyType} that the service accepts. */
export declare enum KnownJsonWebKeyType {
    /** Elliptic Curve. */
    EC = "EC",
    /** Elliptic Curve with a private key which is stored in the HSM. */
    ECHSM = "EC-HSM",
    /** RSA (https://tools.ietf.org/html/rfc3447) */
    RSA = "RSA",
    /** RSA with a private key which is stored in the HSM. */
    RSAHSM = "RSA-HSM",
    /** Octet sequence (used to represent symmetric keys) */
    Oct = "oct",
    /** Octet sequence (used to represent symmetric keys) which is stored the HSM. */
    OctHSM = "oct-HSM"
}
/**
 * Defines values for JsonWebKeyType. \
 * {@link KnownJsonWebKeyType} can be used interchangeably with JsonWebKeyType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **EC**: Elliptic Curve. \
 * **EC-HSM**: Elliptic Curve with a private key which is stored in the HSM. \
 * **RSA**: RSA (https:\/\/tools.ietf.org\/html\/rfc3447) \
 * **RSA-HSM**: RSA with a private key which is stored in the HSM. \
 * **oct**: Octet sequence (used to represent symmetric keys) \
 * **oct-HSM**: Octet sequence (used to represent symmetric keys) which is stored the HSM.
 */
export type JsonWebKeyType = string;
/** Known values of {@link JsonWebKeyOperation} that the service accepts. */
export declare enum KnownJsonWebKeyOperation {
    Encrypt = "encrypt",
    Decrypt = "decrypt",
    Sign = "sign",
    Verify = "verify",
    WrapKey = "wrapKey",
    UnwrapKey = "unwrapKey",
    Import = "import",
    Export = "export"
}
/**
 * Defines values for JsonWebKeyOperation. \
 * {@link KnownJsonWebKeyOperation} can be used interchangeably with JsonWebKeyOperation,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **encrypt** \
 * **decrypt** \
 * **sign** \
 * **verify** \
 * **wrapKey** \
 * **unwrapKey** \
 * **import** \
 * **export**
 */
export type JsonWebKeyOperation = string;
/** Known values of {@link DeletionRecoveryLevel} that the service accepts. */
export declare enum KnownDeletionRecoveryLevel {
    /** Denotes a vault state in which deletion is an irreversible operation, without the possibility for recovery. This level corresponds to no protection being available against a Delete operation; the data is irretrievably lost upon accepting a Delete operation at the entity level or higher (vault, resource group, subscription etc.) */
    Purgeable = "Purgeable",
    /** Denotes a vault state in which deletion is recoverable, and which also permits immediate and permanent deletion (i.e. purge). This level guarantees the recoverability of the deleted entity during the retention interval (90 days), unless a Purge operation is requested, or the subscription is cancelled. System wil permanently delete it after 90 days, if not recovered */
    RecoverablePurgeable = "Recoverable+Purgeable",
    /** Denotes a vault state in which deletion is recoverable without the possibility for immediate and permanent deletion (i.e. purge). This level guarantees the recoverability of the deleted entity during the retention interval(90 days) and while the subscription is still available. System wil permanently delete it after 90 days, if not recovered */
    Recoverable = "Recoverable",
    /** Denotes a vault and subscription state in which deletion is recoverable within retention interval (90 days), immediate and permanent deletion (i.e. purge) is not permitted, and in which the subscription itself  cannot be permanently canceled. System wil permanently delete it after 90 days, if not recovered */
    RecoverableProtectedSubscription = "Recoverable+ProtectedSubscription",
    /** Denotes a vault state in which deletion is recoverable, and which also permits immediate and permanent deletion (i.e. purge when 7<= SoftDeleteRetentionInDays < 90). This level guarantees the recoverability of the deleted entity during the retention interval, unless a Purge operation is requested, or the subscription is cancelled. */
    CustomizedRecoverablePurgeable = "CustomizedRecoverable+Purgeable",
    /** Denotes a vault state in which deletion is recoverable without the possibility for immediate and permanent deletion (i.e. purge when 7<= SoftDeleteRetentionInDays < 90).This level guarantees the recoverability of the deleted entity during the retention interval and while the subscription is still available. */
    CustomizedRecoverable = "CustomizedRecoverable",
    /** Denotes a vault and subscription state in which deletion is recoverable, immediate and permanent deletion (i.e. purge) is not permitted, and in which the subscription itself cannot be permanently canceled when 7<= SoftDeleteRetentionInDays < 90. This level guarantees the recoverability of the deleted entity during the retention interval, and also reflects the fact that the subscription itself cannot be cancelled. */
    CustomizedRecoverableProtectedSubscription = "CustomizedRecoverable+ProtectedSubscription"
}
/**
 * Defines values for DeletionRecoveryLevel. \
 * {@link KnownDeletionRecoveryLevel} can be used interchangeably with DeletionRecoveryLevel,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Purgeable**: Denotes a vault state in which deletion is an irreversible operation, without the possibility for recovery. This level corresponds to no protection being available against a Delete operation; the data is irretrievably lost upon accepting a Delete operation at the entity level or higher (vault, resource group, subscription etc.) \
 * **Recoverable+Purgeable**: Denotes a vault state in which deletion is recoverable, and which also permits immediate and permanent deletion (i.e. purge). This level guarantees the recoverability of the deleted entity during the retention interval (90 days), unless a Purge operation is requested, or the subscription is cancelled. System wil permanently delete it after 90 days, if not recovered \
 * **Recoverable**: Denotes a vault state in which deletion is recoverable without the possibility for immediate and permanent deletion (i.e. purge). This level guarantees the recoverability of the deleted entity during the retention interval(90 days) and while the subscription is still available. System wil permanently delete it after 90 days, if not recovered \
 * **Recoverable+ProtectedSubscription**: Denotes a vault and subscription state in which deletion is recoverable within retention interval (90 days), immediate and permanent deletion (i.e. purge) is not permitted, and in which the subscription itself  cannot be permanently canceled. System wil permanently delete it after 90 days, if not recovered \
 * **CustomizedRecoverable+Purgeable**: Denotes a vault state in which deletion is recoverable, and which also permits immediate and permanent deletion (i.e. purge when 7<= SoftDeleteRetentionInDays < 90). This level guarantees the recoverability of the deleted entity during the retention interval, unless a Purge operation is requested, or the subscription is cancelled. \
 * **CustomizedRecoverable**: Denotes a vault state in which deletion is recoverable without the possibility for immediate and permanent deletion (i.e. purge when 7<= SoftDeleteRetentionInDays < 90).This level guarantees the recoverability of the deleted entity during the retention interval and while the subscription is still available. \
 * **CustomizedRecoverable+ProtectedSubscription**: Denotes a vault and subscription state in which deletion is recoverable, immediate and permanent deletion (i.e. purge) is not permitted, and in which the subscription itself cannot be permanently canceled when 7<= SoftDeleteRetentionInDays < 90. This level guarantees the recoverability of the deleted entity during the retention interval, and also reflects the fact that the subscription itself cannot be cancelled.
 */
export type DeletionRecoveryLevel = string;
/** Known values of {@link JsonWebKeyCurveName} that the service accepts. */
export declare enum KnownJsonWebKeyCurveName {
    /** The NIST P-256 elliptic curve, AKA SECG curve SECP256R1. */
    P256 = "P-256",
    /** The NIST P-384 elliptic curve, AKA SECG curve SECP384R1. */
    P384 = "P-384",
    /** The NIST P-521 elliptic curve, AKA SECG curve SECP521R1. */
    P521 = "P-521",
    /** The SECG SECP256K1 elliptic curve. */
    P256K = "P-256K"
}
/**
 * Defines values for JsonWebKeyCurveName. \
 * {@link KnownJsonWebKeyCurveName} can be used interchangeably with JsonWebKeyCurveName,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **P-256**: The NIST P-256 elliptic curve, AKA SECG curve SECP256R1. \
 * **P-384**: The NIST P-384 elliptic curve, AKA SECG curve SECP384R1. \
 * **P-521**: The NIST P-521 elliptic curve, AKA SECG curve SECP521R1. \
 * **P-256K**: The SECG SECP256K1 elliptic curve.
 */
export type JsonWebKeyCurveName = string;
/** Known values of {@link JsonWebKeyEncryptionAlgorithm} that the service accepts. */
export declare enum KnownJsonWebKeyEncryptionAlgorithm {
    RSAOaep = "RSA-OAEP",
    RSAOaep256 = "RSA-OAEP-256",
    RSA15 = "RSA1_5",
    A128GCM = "A128GCM",
    A192GCM = "A192GCM",
    A256GCM = "A256GCM",
    A128KW = "A128KW",
    A192KW = "A192KW",
    A256KW = "A256KW",
    A128CBC = "A128CBC",
    A192CBC = "A192CBC",
    A256CBC = "A256CBC",
    A128Cbcpad = "A128CBCPAD",
    A192Cbcpad = "A192CBCPAD",
    A256Cbcpad = "A256CBCPAD"
}
/**
 * Defines values for JsonWebKeyEncryptionAlgorithm. \
 * {@link KnownJsonWebKeyEncryptionAlgorithm} can be used interchangeably with JsonWebKeyEncryptionAlgorithm,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **RSA-OAEP** \
 * **RSA-OAEP-256** \
 * **RSA1_5** \
 * **A128GCM** \
 * **A192GCM** \
 * **A256GCM** \
 * **A128KW** \
 * **A192KW** \
 * **A256KW** \
 * **A128CBC** \
 * **A192CBC** \
 * **A256CBC** \
 * **A128CBCPAD** \
 * **A192CBCPAD** \
 * **A256CBCPAD**
 */
export type JsonWebKeyEncryptionAlgorithm = string;
/** Known values of {@link JsonWebKeySignatureAlgorithm} that the service accepts. */
export declare enum KnownJsonWebKeySignatureAlgorithm {
    /** RSASSA-PSS using SHA-256 and MGF1 with SHA-256, as described in https://tools.ietf.org/html/rfc7518 */
    PS256 = "PS256",
    /** RSASSA-PSS using SHA-384 and MGF1 with SHA-384, as described in https://tools.ietf.org/html/rfc7518 */
    PS384 = "PS384",
    /** RSASSA-PSS using SHA-512 and MGF1 with SHA-512, as described in https://tools.ietf.org/html/rfc7518 */
    PS512 = "PS512",
    /** RSASSA-PKCS1-v1_5 using SHA-256, as described in https://tools.ietf.org/html/rfc7518 */
    RS256 = "RS256",
    /** RSASSA-PKCS1-v1_5 using SHA-384, as described in https://tools.ietf.org/html/rfc7518 */
    RS384 = "RS384",
    /** RSASSA-PKCS1-v1_5 using SHA-512, as described in https://tools.ietf.org/html/rfc7518 */
    RS512 = "RS512",
    /** Reserved */
    Rsnull = "RSNULL",
    /** ECDSA using P-256 and SHA-256, as described in https://tools.ietf.org/html/rfc7518. */
    ES256 = "ES256",
    /** ECDSA using P-384 and SHA-384, as described in https://tools.ietf.org/html/rfc7518 */
    ES384 = "ES384",
    /** ECDSA using P-521 and SHA-512, as described in https://tools.ietf.org/html/rfc7518 */
    ES512 = "ES512",
    /** ECDSA using P-256K and SHA-256, as described in https://tools.ietf.org/html/rfc7518 */
    ES256K = "ES256K"
}
/**
 * Defines values for JsonWebKeySignatureAlgorithm. \
 * {@link KnownJsonWebKeySignatureAlgorithm} can be used interchangeably with JsonWebKeySignatureAlgorithm,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **PS256**: RSASSA-PSS using SHA-256 and MGF1 with SHA-256, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **PS384**: RSASSA-PSS using SHA-384 and MGF1 with SHA-384, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **PS512**: RSASSA-PSS using SHA-512 and MGF1 with SHA-512, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **RS256**: RSASSA-PKCS1-v1_5 using SHA-256, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **RS384**: RSASSA-PKCS1-v1_5 using SHA-384, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **RS512**: RSASSA-PKCS1-v1_5 using SHA-512, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **RSNULL**: Reserved \
 * **ES256**: ECDSA using P-256 and SHA-256, as described in https:\/\/tools.ietf.org\/html\/rfc7518. \
 * **ES384**: ECDSA using P-384 and SHA-384, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **ES512**: ECDSA using P-521 and SHA-512, as described in https:\/\/tools.ietf.org\/html\/rfc7518 \
 * **ES256K**: ECDSA using P-256K and SHA-256, as described in https:\/\/tools.ietf.org\/html\/rfc7518
 */
export type JsonWebKeySignatureAlgorithm = string;
/** Known values of {@link KeyEncryptionAlgorithm} that the service accepts. */
export declare enum KnownKeyEncryptionAlgorithm {
    CKMRSAAESKEYWrap = "CKM_RSA_AES_KEY_WRAP",
    RSAAESKEYWrap256 = "RSA_AES_KEY_WRAP_256",
    RSAAESKEYWrap384 = "RSA_AES_KEY_WRAP_384"
}
/**
 * Defines values for KeyEncryptionAlgorithm. \
 * {@link KnownKeyEncryptionAlgorithm} can be used interchangeably with KeyEncryptionAlgorithm,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **CKM_RSA_AES_KEY_WRAP** \
 * **RSA_AES_KEY_WRAP_256** \
 * **RSA_AES_KEY_WRAP_384**
 */
export type KeyEncryptionAlgorithm = string;
/** Defines values for ActionType. */
export type ActionType = "Rotate" | "Notify";
/** Optional parameters. */
export interface CreateKeyOptionalParams extends coreClient.OperationOptions {
    /** The key size in bits. For example: 2048, 3072, or 4096 for RSA. */
    keySize?: number;
    /** The public exponent for a RSA key. */
    publicExponent?: number;
    /** Array of JsonWebKeyOperation */
    keyOps?: JsonWebKeyOperation[];
    /** The attributes of a key managed by the key vault service. */
    keyAttributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /** Elliptic curve name. For valid values, see JsonWebKeyCurveName. */
    curve?: JsonWebKeyCurveName;
    /** The policy rules under which the key can be exported. */
    releasePolicy?: KeyReleasePolicy;
}
/** Contains response data for the createKey operation. */
export type CreateKeyResponse = KeyBundle;
/** Optional parameters. */
export interface RotateKeyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the rotateKey operation. */
export type RotateKeyResponse = KeyBundle;
/** Optional parameters. */
export interface ImportKeyOptionalParams extends coreClient.OperationOptions {
    /** Whether to import as a hardware key (HSM) or software key. */
    hsm?: boolean;
    /** The key management attributes. */
    keyAttributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /** The policy rules under which the key can be exported. */
    releasePolicy?: KeyReleasePolicy;
}
/** Contains response data for the importKey operation. */
export type ImportKeyResponse = KeyBundle;
/** Optional parameters. */
export interface DeleteKeyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the deleteKey operation. */
export type DeleteKeyResponse = DeletedKeyBundle;
/** Optional parameters. */
export interface UpdateKeyOptionalParams extends coreClient.OperationOptions {
    /** Json web key operations. For more information on possible key operations, see JsonWebKeyOperation. */
    keyOps?: JsonWebKeyOperation[];
    /** The attributes of a key managed by the key vault service. */
    keyAttributes?: KeyAttributes;
    /** Application specific metadata in the form of key-value pairs. */
    tags?: {
        [propertyName: string]: string;
    };
    /** The policy rules under which the key can be exported. */
    releasePolicy?: KeyReleasePolicy;
}
/** Contains response data for the updateKey operation. */
export type UpdateKeyResponse = KeyBundle;
/** Optional parameters. */
export interface GetKeyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the getKey operation. */
export type GetKeyResponse = KeyBundle;
/** Optional parameters. */
export interface GetKeyVersionsOptionalParams extends coreClient.OperationOptions {
    /** Maximum number of results to return in a page. If not specified the service will return up to 25 results. */
    maxresults?: number;
}
/** Contains response data for the getKeyVersions operation. */
export type GetKeyVersionsResponse = KeyListResult;
/** Optional parameters. */
export interface GetKeysOptionalParams extends coreClient.OperationOptions {
    /** Maximum number of results to return in a page. If not specified the service will return up to 25 results. */
    maxresults?: number;
}
/** Contains response data for the getKeys operation. */
export type GetKeysResponse = KeyListResult;
/** Optional parameters. */
export interface BackupKeyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the backupKey operation. */
export type BackupKeyResponse = BackupKeyResult;
/** Optional parameters. */
export interface RestoreKeyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the restoreKey operation. */
export type RestoreKeyResponse = KeyBundle;
/** Optional parameters. */
export interface EncryptOptionalParams extends coreClient.OperationOptions {
    /** Cryptographically random, non-repeating initialization vector for symmetric algorithms. */
    iv?: Uint8Array;
    /** Additional data to authenticate but not encrypt/decrypt when using authenticated crypto algorithms. */
    additionalAuthenticatedData?: Uint8Array;
    /** The tag to authenticate when performing decryption with an authenticated algorithm. */
    authenticationTag?: Uint8Array;
}
/** Contains response data for the encrypt operation. */
export type EncryptResponse = KeyOperationResult;
/** Optional parameters. */
export interface DecryptOptionalParams extends coreClient.OperationOptions {
    /** Cryptographically random, non-repeating initialization vector for symmetric algorithms. */
    iv?: Uint8Array;
    /** Additional data to authenticate but not encrypt/decrypt when using authenticated crypto algorithms. */
    additionalAuthenticatedData?: Uint8Array;
    /** The tag to authenticate when performing decryption with an authenticated algorithm. */
    authenticationTag?: Uint8Array;
}
/** Contains response data for the decrypt operation. */
export type DecryptResponse = KeyOperationResult;
/** Optional parameters. */
export interface SignOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the sign operation. */
export type SignResponse = KeyOperationResult;
/** Optional parameters. */
export interface VerifyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the verify operation. */
export type VerifyResponse = KeyVerifyResult;
/** Optional parameters. */
export interface WrapKeyOptionalParams extends coreClient.OperationOptions {
    /** Cryptographically random, non-repeating initialization vector for symmetric algorithms. */
    iv?: Uint8Array;
    /** Additional data to authenticate but not encrypt/decrypt when using authenticated crypto algorithms. */
    additionalAuthenticatedData?: Uint8Array;
    /** The tag to authenticate when performing decryption with an authenticated algorithm. */
    authenticationTag?: Uint8Array;
}
/** Contains response data for the wrapKey operation. */
export type WrapKeyResponse = KeyOperationResult;
/** Optional parameters. */
export interface UnwrapKeyOptionalParams extends coreClient.OperationOptions {
    /** Cryptographically random, non-repeating initialization vector for symmetric algorithms. */
    iv?: Uint8Array;
    /** Additional data to authenticate but not encrypt/decrypt when using authenticated crypto algorithms. */
    additionalAuthenticatedData?: Uint8Array;
    /** The tag to authenticate when performing decryption with an authenticated algorithm. */
    authenticationTag?: Uint8Array;
}
/** Contains response data for the unwrapKey operation. */
export type UnwrapKeyResponse = KeyOperationResult;
/** Optional parameters. */
export interface ReleaseOptionalParams extends coreClient.OperationOptions {
    /** A client provided nonce for freshness. */
    nonce?: string;
    /** The encryption algorithm to use to protected the exported key material */
    enc?: KeyEncryptionAlgorithm;
}
/** Contains response data for the release operation. */
export type ReleaseResponse = KeyReleaseResult;
/** Optional parameters. */
export interface GetDeletedKeysOptionalParams extends coreClient.OperationOptions {
    /** Maximum number of results to return in a page. If not specified the service will return up to 25 results. */
    maxresults?: number;
}
/** Contains response data for the getDeletedKeys operation. */
export type GetDeletedKeysResponse = DeletedKeyListResult;
/** Optional parameters. */
export interface GetDeletedKeyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the getDeletedKey operation. */
export type GetDeletedKeyResponse = DeletedKeyBundle;
/** Optional parameters. */
export interface PurgeDeletedKeyOptionalParams extends coreClient.OperationOptions {
}
/** Optional parameters. */
export interface RecoverDeletedKeyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the recoverDeletedKey operation. */
export type RecoverDeletedKeyResponse = KeyBundle;
/** Optional parameters. */
export interface GetKeyRotationPolicyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the getKeyRotationPolicy operation. */
export type GetKeyRotationPolicyResponse = KeyRotationPolicy;
/** Optional parameters. */
export interface UpdateKeyRotationPolicyOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the updateKeyRotationPolicy operation. */
export type UpdateKeyRotationPolicyResponse = KeyRotationPolicy;
/** Optional parameters. */
export interface GetRandomBytesOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the getRandomBytes operation. */
export type GetRandomBytesResponse = RandomBytes;
/** Optional parameters. */
export interface GetKeyVersionsNextOptionalParams extends coreClient.OperationOptions {
    /** Maximum number of results to return in a page. If not specified the service will return up to 25 results. */
    maxresults?: number;
}
/** Contains response data for the getKeyVersionsNext operation. */
export type GetKeyVersionsNextResponse = KeyListResult;
/** Optional parameters. */
export interface GetKeysNextOptionalParams extends coreClient.OperationOptions {
    /** Maximum number of results to return in a page. If not specified the service will return up to 25 results. */
    maxresults?: number;
}
/** Contains response data for the getKeysNext operation. */
export type GetKeysNextResponse = KeyListResult;
/** Optional parameters. */
export interface GetDeletedKeysNextOptionalParams extends coreClient.OperationOptions {
    /** Maximum number of results to return in a page. If not specified the service will return up to 25 results. */
    maxresults?: number;
}
/** Contains response data for the getDeletedKeysNext operation. */
export type GetDeletedKeysNextResponse = DeletedKeyListResult;
/** Optional parameters. */
export interface KeyVaultClientOptionalParams extends coreHttpCompat.ExtendedServiceClientOptions {
    /** Overrides client endpoint. */
    endpoint?: string;
}
//# sourceMappingURL=index.d.ts.map