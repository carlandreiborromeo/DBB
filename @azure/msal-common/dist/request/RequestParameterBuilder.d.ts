import { ResponseMode } from "../utils/Constants.js";
import { StringDict } from "../utils/MsalTypes.js";
import { ApplicationTelemetry, LibraryInfo } from "../config/ClientConfiguration.js";
import { ServerTelemetryManager } from "../telemetry/server/ServerTelemetryManager.js";
import { ClientInfo } from "../account/ClientInfo.js";
import { IPerformanceClient } from "../telemetry/performance/IPerformanceClient.js";
/** @internal */
export declare class RequestParameterBuilder {
    private parameters;
    private readonly performanceClient?;
    private readonly correlationId?;
    constructor(correlationId?: string, performanceClient?: IPerformanceClient);
    /**
     * add response_type = code
     */
    addResponseTypeCode(): void;
    /**
     * add response_type = token id_token
     */
    addResponseTypeForTokenAndIdToken(): void;
    /**
     * add response_mode. defaults to query.
     * @param responseMode
     */
    addResponseMode(responseMode?: ResponseMode): void;
    /**
     * Add flag to indicate STS should attempt to use WAM if available
     */
    addNativeBroker(): void;
    /**
     * add scopes. set addOidcScopes to false to prevent default scopes in non-user scenarios
     * @param scopeSet
     * @param addOidcScopes
     */
    addScopes(scopes: string[], addOidcScopes?: boolean, defaultScopes?: Array<string>): void;
    /**
     * add clientId
     * @param clientId
     */
    addClientId(clientId: string): void;
    /**
     * add redirect_uri
     * @param redirectUri
     */
    addRedirectUri(redirectUri: string): void;
    /**
     * add post logout redirectUri
     * @param redirectUri
     */
    addPostLogoutRedirectUri(redirectUri: string): void;
    /**
     * add id_token_hint to logout request
     * @param idTokenHint
     */
    addIdTokenHint(idTokenHint: string): void;
    /**
     * add domain_hint
     * @param domainHint
     */
    addDomainHint(domainHint: string): void;
    /**
     * add login_hint
     * @param loginHint
     */
    addLoginHint(loginHint: string): void;
    /**
     * Adds the CCS (Cache Credential Service) query parameter for login_hint
     * @param loginHint
     */
    addCcsUpn(loginHint: string): void;
    /**
     * Adds the CCS (Cache Credential Service) query parameter for account object
     * @param loginHint
     */
    addCcsOid(clientInfo: ClientInfo): void;
    /**
     * add sid
     * @param sid
     */
    addSid(sid: string): void;
    /**
     * add claims
     * @param claims
     */
    addClaims(claims?: string, clientCapabilities?: Array<string>): void;
    /**
     * add correlationId
     * @param correlationId
     */
    addCorrelationId(correlationId: string): void;
    /**
     * add library info query params
     * @param libraryInfo
     */
    addLibraryInfo(libraryInfo: LibraryInfo): void;
    /**
     * Add client telemetry parameters
     * @param appTelemetry
     */
    addApplicationTelemetry(appTelemetry: ApplicationTelemetry): void;
    /**
     * add prompt
     * @param prompt
     */
    addPrompt(prompt: string): void;
    /**
     * add state
     * @param state
     */
    addState(state: string): void;
    /**
     * add nonce
     * @param nonce
     */
    addNonce(nonce: string): void;
    /**
     * add code_challenge and code_challenge_method
     * - throw if either of them are not passed
     * @param codeChallenge
     * @param codeChallengeMethod
     */
    addCodeChallengeParams(codeChallenge: string, codeChallengeMethod: string): void;
    /**
     * add the `authorization_code` passed by the user to exchange for a token
     * @param code
     */
    addAuthorizationCode(code: string): void;
    /**
     * add the `authorization_code` passed by the user to exchange for a token
     * @param code
     */
    addDeviceCode(code: string): void;
    /**
     * add the `refreshToken` passed by the user
     * @param refreshToken
     */
    addRefreshToken(refreshToken: string): void;
    /**
     * add the `code_verifier` passed by the user to exchange for a token
     * @param codeVerifier
     */
    addCodeVerifier(codeVerifier: string): void;
    /**
     * add client_secret
     * @param clientSecret
     */
    addClientSecret(clientSecret: string): void;
    /**
     * add clientAssertion for confidential client flows
     * @param clientAssertion
     */
    addClientAssertion(clientAssertion: string): void;
    /**
     * add clientAssertionType for confidential client flows
     * @param clientAssertionType
     */
    addClientAssertionType(clientAssertionType: string): void;
    /**
     * add OBO assertion for confidential client flows
     * @param clientAssertion
     */
    addOboAssertion(oboAssertion: string): void;
    /**
     * add grant type
     * @param grantType
     */
    addRequestTokenUse(tokenUse: string): void;
    /**
     * add grant type
     * @param grantType
     */
    addGrantType(grantType: string): void;
    /**
     * add client info
     *
     */
    addClientInfo(): void;
    /**
     * add extraQueryParams
     * @param eQParams
     */
    addExtraQueryParameters(eQParams: StringDict): void;
    addClientCapabilitiesToClaims(claims?: string, clientCapabilities?: Array<string>): string;
    /**
     * adds `username` for Password Grant flow
     * @param username
     */
    addUsername(username: string): void;
    /**
     * adds `password` for Password Grant flow
     * @param password
     */
    addPassword(password: string): void;
    /**
     * add pop_jwk to query params
     * @param cnfString
     */
    addPopToken(cnfString: string): void;
    /**
     * add SSH JWK and key ID to query params
     */
    addSshJwk(sshJwkString: string): void;
    /**
     * add server telemetry fields
     * @param serverTelemetryManager
     */
    addServerTelemetry(serverTelemetryManager: ServerTelemetryManager): void;
    /**
     * Adds parameter that indicates to the server that throttling is supported
     */
    addThrottling(): void;
    /**
     * Adds logout_hint parameter for "silent" logout which prevent server account picker
     */
    addLogoutHint(logoutHint: string): void;
    addBrokerParameters(params: {
        brokerClientId: string;
        brokerRedirectUri: string;
    }): void;
    /**
     * Utility to create a URL from the params map
     */
    createQueryString(): string;
}
//# sourceMappingURL=RequestParameterBuilder.d.ts.map