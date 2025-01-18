import { CommonAuthorizationCodeRequest } from "@azure/msal-common/node";
/**
 * Request object passed by user to acquire a token from the server exchanging a valid authorization code (second leg of OAuth2.0 Authorization Code flow)
 *
 * - scopes                  - Array of scopes the application is requesting access to.
 * - claims                  - A stringified claims request which will be added to all /authorize and /token calls
 * - authority:              - URL of the authority, the security token service (STS) from which MSAL will acquire tokens. If authority is set on client application object, this will override that value. Overriding the value will cause for authority validation to happen each time. If the same authority will be used for all request, set on the application object instead of the requests.
 * - correlationId           - Unique GUID set per request to trace a request end-to-end for telemetry purposes.
 * - redirectUri             - The redirect URI of your app, where the authority will redirect to after the user inputs credentials and consents. It must exactly match one of the redirect URIs you registered in the portal.
 * - tokenQueryParameters    - String to string map of custom query parameters added to the /token call
 * - code                    - The authorization_code that the user acquired in the first leg of the flow.
 * - codeVerifier            - The same code_verifier that was used to obtain the authorization_code. Required if PKCE was used in the authorization code grant request.For more information, see the PKCE RFC: https://tools.ietf.org/html/rfc7636
 * - state                   - Unique GUID generated by the user that is cached by the user and sent to the server during the first leg of the flow. This string is sent back by the server with the authorization code. The user cached state is then compared with the state received from the server to mitigate the risk of CSRF attacks. See https://datatracker.ietf.org/doc/html/rfc6819#section-3.6.
 * @public
 */
export type AuthorizationCodeRequest = Partial<Omit<CommonAuthorizationCodeRequest, "scopes" | "redirectUri" | "code" | "authenticationScheme" | "resourceRequestMethod" | "resourceRequestUri" | "requestedClaimsHash" | "storeInCache">> & {
    scopes: Array<string>;
    redirectUri: string;
    code: string;
    state?: string;
};
//# sourceMappingURL=AuthorizationCodeRequest.d.ts.map