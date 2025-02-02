import { ServerAuthorizationCodeResponse } from "@azure/msal-common/node";
/**
 * Interface for LoopbackClient allowing to replace the default loopback server with a custom implementation.
 * @public
 */
export interface ILoopbackClient {
    listenForAuthCode(successTemplate?: string, errorTemplate?: string): Promise<ServerAuthorizationCodeResponse>;
    getRedirectUri(): string;
    closeServer(): void;
}
//# sourceMappingURL=ILoopbackClient.d.ts.map