import { AbortSignalLike } from "@azure/abort-controller";
import { OperationOptions } from "@azure/core-client";
import { KeyVaultClient } from "../../generated/keyVaultClient.js";
import { KeyVaultKey } from "../../keysModels.js";
import { KeyVaultKeyPollOperation, KeyVaultKeyPollOperationState } from "../keyVaultKeyPoller.js";
/**
 * An interface representing the state of a delete key's poll operation
 */
export interface RecoverDeletedKeyPollOperationState extends KeyVaultKeyPollOperationState<KeyVaultKey> {
}
export declare class RecoverDeletedKeyPollOperation extends KeyVaultKeyPollOperation<RecoverDeletedKeyPollOperationState, KeyVaultKey> {
    state: RecoverDeletedKeyPollOperationState;
    private vaultUrl;
    private client;
    private operationOptions;
    constructor(state: RecoverDeletedKeyPollOperationState, vaultUrl: string, client: KeyVaultClient, operationOptions?: OperationOptions);
    /**
     * The getKey method gets a specified key and is applicable to any key stored in Azure Key Vault.
     * This operation requires the keys/get permission.
     */
    private getKey;
    /**
     * Sends a request to recover a deleted Key Vault Key based on the given name.
     * Since the Key Vault Key won't be immediately recover the deleted key, we have {@link beginRecoverDeletedKey}.
     */
    private recoverDeletedKey;
    /**
     * Reaches to the service and updates the delete key's poll operation.
     */
    update(options?: {
        abortSignal?: AbortSignalLike;
        fireProgress?: (state: RecoverDeletedKeyPollOperationState) => void;
    }): Promise<RecoverDeletedKeyPollOperation>;
}
//# sourceMappingURL=operation.d.ts.map