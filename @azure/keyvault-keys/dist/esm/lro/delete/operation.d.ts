import { AbortSignalLike } from "@azure/abort-controller";
import { OperationOptions } from "@azure/core-client";
import { KeyVaultClient } from "../../generated/keyVaultClient.js";
import { DeletedKey } from "../../keysModels.js";
import { KeyVaultKeyPollOperation, KeyVaultKeyPollOperationState } from "../keyVaultKeyPoller.js";
/**
 * An interface representing the state of a delete key's poll operation
 */
export interface DeleteKeyPollOperationState extends KeyVaultKeyPollOperationState<DeletedKey> {
}
export declare class DeleteKeyPollOperation extends KeyVaultKeyPollOperation<DeleteKeyPollOperationState, DeletedKey> {
    state: DeleteKeyPollOperationState;
    private vaultUrl;
    private client;
    private operationOptions;
    constructor(state: DeleteKeyPollOperationState, vaultUrl: string, client: KeyVaultClient, operationOptions?: OperationOptions);
    /**
     * Sends a delete request for the given Key Vault Key's name to the Key Vault service.
     * Since the Key Vault Key won't be immediately deleted, we have {@link beginDeleteKey}.
     */
    private deleteKey;
    /**
     * The getDeletedKey method returns the specified deleted key along with its properties.
     * This operation requires the keys/get permission.
     */
    private getDeletedKey;
    /**
     * Reaches to the service and updates the delete key's poll operation.
     */
    update(options?: {
        abortSignal?: AbortSignalLike;
        fireProgress?: (state: DeleteKeyPollOperationState) => void;
    }): Promise<DeleteKeyPollOperation>;
}
//# sourceMappingURL=operation.d.ts.map