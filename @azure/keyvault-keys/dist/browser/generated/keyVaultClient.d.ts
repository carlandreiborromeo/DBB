import * as coreHttpCompat from "@azure/core-http-compat";
import { ApiVersion75, KeyVaultClientOptionalParams, JsonWebKeyType, CreateKeyOptionalParams, CreateKeyResponse, RotateKeyOptionalParams, RotateKeyResponse, JsonWebKey, ImportKeyOptionalParams, ImportKeyResponse, DeleteKeyOptionalParams, DeleteKeyResponse, UpdateKeyOptionalParams, UpdateKeyResponse, GetKeyOptionalParams, GetKeyResponse, GetKeyVersionsOptionalParams, GetKeyVersionsResponse, GetKeysOptionalParams, GetKeysResponse, BackupKeyOptionalParams, BackupKeyResponse, RestoreKeyOptionalParams, RestoreKeyResponse, JsonWebKeyEncryptionAlgorithm, EncryptOptionalParams, EncryptResponse, DecryptOptionalParams, DecryptResponse, JsonWebKeySignatureAlgorithm, SignOptionalParams, SignResponse, VerifyOptionalParams, VerifyResponse, WrapKeyOptionalParams, WrapKeyResponse, UnwrapKeyOptionalParams, UnwrapKeyResponse, ReleaseOptionalParams, ReleaseResponse, GetDeletedKeysOptionalParams, GetDeletedKeysResponse, GetDeletedKeyOptionalParams, GetDeletedKeyResponse, PurgeDeletedKeyOptionalParams, RecoverDeletedKeyOptionalParams, RecoverDeletedKeyResponse, GetKeyRotationPolicyOptionalParams, GetKeyRotationPolicyResponse, KeyRotationPolicy, UpdateKeyRotationPolicyOptionalParams, UpdateKeyRotationPolicyResponse, GetRandomBytesOptionalParams, GetRandomBytesResponse, GetKeyVersionsNextOptionalParams, GetKeyVersionsNextResponse, GetKeysNextOptionalParams, GetKeysNextResponse, GetDeletedKeysNextOptionalParams, GetDeletedKeysNextResponse } from "./models/index.js";
export declare class KeyVaultClient extends coreHttpCompat.ExtendedServiceClient {
    apiVersion: ApiVersion75;
    /**
     * Initializes a new instance of the KeyVaultClient class.
     * @param apiVersion Api Version
     * @param options The parameter options
     */
    constructor(apiVersion: ApiVersion75, options?: KeyVaultClientOptionalParams);
    /**
     * The create key operation can be used to create any key type in Azure Key Vault. If the named key
     * already exists, Azure Key Vault creates a new version of the key. It requires the keys/create
     * permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name for the new key. The system will generate the version name for the new key.
     *                The value you provide may be copied globally for the purpose of running the service. The value
     *                provided should not include personally identifiable or sensitive information.
     * @param kty The type of key to create. For valid values, see JsonWebKeyType.
     * @param options The options parameters.
     */
    createKey(vaultBaseUrl: string, keyName: string, kty: JsonWebKeyType, options?: CreateKeyOptionalParams): Promise<CreateKeyResponse>;
    /**
     * The operation will rotate the key based on the key policy. It requires the keys/rotate permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of key to be rotated. The system will generate a new version in the
     *                specified key.
     * @param options The options parameters.
     */
    rotateKey(vaultBaseUrl: string, keyName: string, options?: RotateKeyOptionalParams): Promise<RotateKeyResponse>;
    /**
     * The import key operation may be used to import any key type into an Azure Key Vault. If the named
     * key already exists, Azure Key Vault creates a new version of the key. This operation requires the
     * keys/import permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName Name for the imported key. The value you provide may be copied globally for the
     *                purpose of running the service. The value provided should not include personally identifiable or
     *                sensitive information.
     * @param key The Json web key
     * @param options The options parameters.
     */
    importKey(vaultBaseUrl: string, keyName: string, key: JsonWebKey, options?: ImportKeyOptionalParams): Promise<ImportKeyResponse>;
    /**
     * The delete key operation cannot be used to remove individual versions of a key. This operation
     * removes the cryptographic material associated with the key, which means the key is not usable for
     * Sign/Verify, Wrap/Unwrap or Encrypt/Decrypt operations. This operation requires the keys/delete
     * permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key to delete.
     * @param options The options parameters.
     */
    deleteKey(vaultBaseUrl: string, keyName: string, options?: DeleteKeyOptionalParams): Promise<DeleteKeyResponse>;
    /**
     * In order to perform this operation, the key must already exist in the Key Vault. Note: The
     * cryptographic material of a key itself cannot be changed. This operation requires the keys/update
     * permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of key to update.
     * @param keyVersion The version of the key to update.
     * @param options The options parameters.
     */
    updateKey(vaultBaseUrl: string, keyName: string, keyVersion: string, options?: UpdateKeyOptionalParams): Promise<UpdateKeyResponse>;
    /**
     * The get key operation is applicable to all key types. If the requested key is symmetric, then no key
     * material is released in the response. This operation requires the keys/get permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key to get.
     * @param keyVersion Adding the version parameter retrieves a specific version of a key. This URI
     *                   fragment is optional. If not specified, the latest version of the key is returned.
     * @param options The options parameters.
     */
    getKey(vaultBaseUrl: string, keyName: string, keyVersion: string, options?: GetKeyOptionalParams): Promise<GetKeyResponse>;
    /**
     * The full key identifier, attributes, and tags are provided in the response. This operation requires
     * the keys/list permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param options The options parameters.
     */
    getKeyVersions(vaultBaseUrl: string, keyName: string, options?: GetKeyVersionsOptionalParams): Promise<GetKeyVersionsResponse>;
    /**
     * Retrieves a list of the keys in the Key Vault as JSON Web Key structures that contain the public
     * part of a stored key. The LIST operation is applicable to all key types, however only the base key
     * identifier, attributes, and tags are provided in the response. Individual versions of a key are not
     * listed in the response. This operation requires the keys/list permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param options The options parameters.
     */
    getKeys(vaultBaseUrl: string, options?: GetKeysOptionalParams): Promise<GetKeysResponse>;
    /**
     * The Key Backup operation exports a key from Azure Key Vault in a protected form. Note that this
     * operation does NOT return key material in a form that can be used outside the Azure Key Vault
     * system, the returned key material is either protected to a Azure Key Vault HSM or to Azure Key Vault
     * itself. The intent of this operation is to allow a client to GENERATE a key in one Azure Key Vault
     * instance, BACKUP the key, and then RESTORE it into another Azure Key Vault instance. The BACKUP
     * operation may be used to export, in protected form, any key type from Azure Key Vault. Individual
     * versions of a key cannot be backed up. BACKUP / RESTORE can be performed within geographical
     * boundaries only; meaning that a BACKUP from one geographical area cannot be restored to another
     * geographical area. For example, a backup from the US geographical area cannot be restored in an EU
     * geographical area. This operation requires the key/backup permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param options The options parameters.
     */
    backupKey(vaultBaseUrl: string, keyName: string, options?: BackupKeyOptionalParams): Promise<BackupKeyResponse>;
    /**
     * Imports a previously backed up key into Azure Key Vault, restoring the key, its key identifier,
     * attributes and access control policies. The RESTORE operation may be used to import a previously
     * backed up key. Individual versions of a key cannot be restored. The key is restored in its entirety
     * with the same key name as it had when it was backed up. If the key name is not available in the
     * target Key Vault, the RESTORE operation will be rejected. While the key name is retained during
     * restore, the final key identifier will change if the key is restored to a different vault. Restore
     * will restore all versions and preserve version identifiers. The RESTORE operation is subject to
     * security constraints: The target Key Vault must be owned by the same Microsoft Azure Subscription as
     * the source Key Vault The user must have RESTORE permission in the target Key Vault. This operation
     * requires the keys/restore permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyBundleBackup The backup blob associated with a key bundle.
     * @param options The options parameters.
     */
    restoreKey(vaultBaseUrl: string, keyBundleBackup: Uint8Array, options?: RestoreKeyOptionalParams): Promise<RestoreKeyResponse>;
    /**
     * The ENCRYPT operation encrypts an arbitrary sequence of bytes using an encryption key that is stored
     * in Azure Key Vault. Note that the ENCRYPT operation only supports a single block of data, the size
     * of which is dependent on the target key and the encryption algorithm to be used. The ENCRYPT
     * operation is only strictly necessary for symmetric keys stored in Azure Key Vault since protection
     * with an asymmetric key can be performed using public portion of the key. This operation is supported
     * for asymmetric keys as a convenience for callers that have a key-reference but do not have access to
     * the public key material. This operation requires the keys/encrypt permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param keyVersion The version of the key.
     * @param algorithm algorithm identifier
     * @param value
     * @param options The options parameters.
     */
    encrypt(vaultBaseUrl: string, keyName: string, keyVersion: string, algorithm: JsonWebKeyEncryptionAlgorithm, value: Uint8Array, options?: EncryptOptionalParams): Promise<EncryptResponse>;
    /**
     * The DECRYPT operation decrypts a well-formed block of ciphertext using the target encryption key and
     * specified algorithm. This operation is the reverse of the ENCRYPT operation; only a single block of
     * data may be decrypted, the size of this block is dependent on the target key and the algorithm to be
     * used. The DECRYPT operation applies to asymmetric and symmetric keys stored in Azure Key Vault since
     * it uses the private portion of the key. This operation requires the keys/decrypt permission.
     * Microsoft recommends not to use CBC algorithms for decryption without first ensuring the integrity
     * of the ciphertext using an HMAC, for example. See
     * https://docs.microsoft.com/dotnet/standard/security/vulnerabilities-cbc-mode for more information.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param keyVersion The version of the key.
     * @param algorithm algorithm identifier
     * @param value
     * @param options The options parameters.
     */
    decrypt(vaultBaseUrl: string, keyName: string, keyVersion: string, algorithm: JsonWebKeyEncryptionAlgorithm, value: Uint8Array, options?: DecryptOptionalParams): Promise<DecryptResponse>;
    /**
     * The SIGN operation is applicable to asymmetric and symmetric keys stored in Azure Key Vault since
     * this operation uses the private portion of the key. This operation requires the keys/sign
     * permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param keyVersion The version of the key.
     * @param algorithm The signing/verification algorithm identifier. For more information on possible
     *                  algorithm types, see JsonWebKeySignatureAlgorithm.
     * @param value
     * @param options The options parameters.
     */
    sign(vaultBaseUrl: string, keyName: string, keyVersion: string, algorithm: JsonWebKeySignatureAlgorithm, value: Uint8Array, options?: SignOptionalParams): Promise<SignResponse>;
    /**
     * The VERIFY operation is applicable to symmetric keys stored in Azure Key Vault. VERIFY is not
     * strictly necessary for asymmetric keys stored in Azure Key Vault since signature verification can be
     * performed using the public portion of the key but this operation is supported as a convenience for
     * callers that only have a key-reference and not the public portion of the key. This operation
     * requires the keys/verify permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param keyVersion The version of the key.
     * @param algorithm The signing/verification algorithm. For more information on possible algorithm
     *                  types, see JsonWebKeySignatureAlgorithm.
     * @param digest The digest used for signing.
     * @param signature The signature to be verified.
     * @param options The options parameters.
     */
    verify(vaultBaseUrl: string, keyName: string, keyVersion: string, algorithm: JsonWebKeySignatureAlgorithm, digest: Uint8Array, signature: Uint8Array, options?: VerifyOptionalParams): Promise<VerifyResponse>;
    /**
     * The WRAP operation supports encryption of a symmetric key using a key encryption key that has
     * previously been stored in an Azure Key Vault. The WRAP operation is only strictly necessary for
     * symmetric keys stored in Azure Key Vault since protection with an asymmetric key can be performed
     * using the public portion of the key. This operation is supported for asymmetric keys as a
     * convenience for callers that have a key-reference but do not have access to the public key material.
     * This operation requires the keys/wrapKey permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param keyVersion The version of the key.
     * @param algorithm algorithm identifier
     * @param value
     * @param options The options parameters.
     */
    wrapKey(vaultBaseUrl: string, keyName: string, keyVersion: string, algorithm: JsonWebKeyEncryptionAlgorithm, value: Uint8Array, options?: WrapKeyOptionalParams): Promise<WrapKeyResponse>;
    /**
     * The UNWRAP operation supports decryption of a symmetric key using the target key encryption key.
     * This operation is the reverse of the WRAP operation. The UNWRAP operation applies to asymmetric and
     * symmetric keys stored in Azure Key Vault since it uses the private portion of the key. This
     * operation requires the keys/unwrapKey permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param keyVersion The version of the key.
     * @param algorithm algorithm identifier
     * @param value
     * @param options The options parameters.
     */
    unwrapKey(vaultBaseUrl: string, keyName: string, keyVersion: string, algorithm: JsonWebKeyEncryptionAlgorithm, value: Uint8Array, options?: UnwrapKeyOptionalParams): Promise<UnwrapKeyResponse>;
    /**
     * The release key operation is applicable to all key types. The target key must be marked exportable.
     * This operation requires the keys/release permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key to get.
     * @param keyVersion Adding the version parameter retrieves a specific version of a key.
     * @param targetAttestationToken The attestation assertion for the target of the key release.
     * @param options The options parameters.
     */
    release(vaultBaseUrl: string, keyName: string, keyVersion: string, targetAttestationToken: string, options?: ReleaseOptionalParams): Promise<ReleaseResponse>;
    /**
     * Retrieves a list of the keys in the Key Vault as JSON Web Key structures that contain the public
     * part of a deleted key. This operation includes deletion-specific information. The Get Deleted Keys
     * operation is applicable for vaults enabled for soft-delete. While the operation can be invoked on
     * any vault, it will return an error if invoked on a non soft-delete enabled vault. This operation
     * requires the keys/list permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param options The options parameters.
     */
    getDeletedKeys(vaultBaseUrl: string, options?: GetDeletedKeysOptionalParams): Promise<GetDeletedKeysResponse>;
    /**
     * The Get Deleted Key operation is applicable for soft-delete enabled vaults. While the operation can
     * be invoked on any vault, it will return an error if invoked on a non soft-delete enabled vault. This
     * operation requires the keys/get permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param options The options parameters.
     */
    getDeletedKey(vaultBaseUrl: string, keyName: string, options?: GetDeletedKeyOptionalParams): Promise<GetDeletedKeyResponse>;
    /**
     * The Purge Deleted Key operation is applicable for soft-delete enabled vaults. While the operation
     * can be invoked on any vault, it will return an error if invoked on a non soft-delete enabled vault.
     * This operation requires the keys/purge permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key
     * @param options The options parameters.
     */
    purgeDeletedKey(vaultBaseUrl: string, keyName: string, options?: PurgeDeletedKeyOptionalParams): Promise<void>;
    /**
     * The Recover Deleted Key operation is applicable for deleted keys in soft-delete enabled vaults. It
     * recovers the deleted key back to its latest version under /keys. An attempt to recover an
     * non-deleted key will return an error. Consider this the inverse of the delete operation on
     * soft-delete enabled vaults. This operation requires the keys/recover permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the deleted key.
     * @param options The options parameters.
     */
    recoverDeletedKey(vaultBaseUrl: string, keyName: string, options?: RecoverDeletedKeyOptionalParams): Promise<RecoverDeletedKeyResponse>;
    /**
     * The GetKeyRotationPolicy operation returns the specified key policy resources in the specified key
     * vault. This operation requires the keys/get permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key in a given key vault.
     * @param options The options parameters.
     */
    getKeyRotationPolicy(vaultBaseUrl: string, keyName: string, options?: GetKeyRotationPolicyOptionalParams): Promise<GetKeyRotationPolicyResponse>;
    /**
     * Set specified members in the key policy. Leave others as undefined. This operation requires the
     * keys/update permission.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key in the given vault.
     * @param keyRotationPolicy The policy for the key.
     * @param options The options parameters.
     */
    updateKeyRotationPolicy(vaultBaseUrl: string, keyName: string, keyRotationPolicy: KeyRotationPolicy, options?: UpdateKeyRotationPolicyOptionalParams): Promise<UpdateKeyRotationPolicyResponse>;
    /**
     * Get the requested number of bytes containing random values from a managed HSM.
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param count The requested number of random bytes.
     * @param options The options parameters.
     */
    getRandomBytes(vaultBaseUrl: string, count: number, options?: GetRandomBytesOptionalParams): Promise<GetRandomBytesResponse>;
    /**
     * GetKeyVersionsNext
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param keyName The name of the key.
     * @param nextLink The nextLink from the previous successful call to the GetKeyVersions method.
     * @param options The options parameters.
     */
    getKeyVersionsNext(vaultBaseUrl: string, keyName: string, nextLink: string, options?: GetKeyVersionsNextOptionalParams): Promise<GetKeyVersionsNextResponse>;
    /**
     * GetKeysNext
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param nextLink The nextLink from the previous successful call to the GetKeys method.
     * @param options The options parameters.
     */
    getKeysNext(vaultBaseUrl: string, nextLink: string, options?: GetKeysNextOptionalParams): Promise<GetKeysNextResponse>;
    /**
     * GetDeletedKeysNext
     * @param vaultBaseUrl The vault name, for example https://myvault.vault.azure.net.
     * @param nextLink The nextLink from the previous successful call to the GetDeletedKeys method.
     * @param options The options parameters.
     */
    getDeletedKeysNext(vaultBaseUrl: string, nextLink: string, options?: GetDeletedKeysNextOptionalParams): Promise<GetDeletedKeysNextResponse>;
}
//# sourceMappingURL=keyVaultClient.d.ts.map