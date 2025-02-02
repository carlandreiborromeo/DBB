import { AccessToken } from '@azure/core-auth';
import { AzureLogger } from '@azure/logger';
import { CommonClientOptions } from '@azure/core-client';
import { GetTokenOptions } from '@azure/core-auth';
import { LogPolicyOptions } from '@azure/core-rest-pipeline';
import { TokenCredential } from '@azure/core-auth';
import type { TracingContext } from '@azure/core-auth';

export { AccessToken }

/**
 * Provides an `errors` array containing {@link AuthenticationError} instance
 * for authentication failures from credentials in a {@link ChainedTokenCredential}.
 */
export declare class AggregateAuthenticationError extends Error {
    /**
     * The array of error objects that were thrown while trying to authenticate
     * with the credentials in a {@link ChainedTokenCredential}.
     */
    errors: any[];
    constructor(errors: any[], errorMessage?: string);
}

/**
 * The Error.name value of an AggregateAuthenticationError
 */
export declare const AggregateAuthenticationErrorName = "AggregateAuthenticationError";

/**
 * Provides details about a failure to authenticate with Azure Active
 * Directory.  The `errorResponse` field contains more details about
 * the specific failure.
 */
export declare class AuthenticationError extends Error {
    /**
     * The HTTP status code returned from the authentication request.
     */
    readonly statusCode: number;
    /**
     * The error response details.
     */
    readonly errorResponse: ErrorResponse;
    constructor(statusCode: number, errorBody: object | string | undefined | null, options?: {
        cause?: unknown;
    });
}

/**
 * The Error.name value of an AuthenticationError
 */
export declare const AuthenticationErrorName = "AuthenticationError";

/**
 * The record to use to find the cached tokens in the cache.
 */
export declare interface AuthenticationRecord {
    /**
     * The associated authority, if used.
     */
    authority: string;
    /**
     * The home account Id.
     */
    homeAccountId: string;
    /**
     * The associated client ID.
     */
    clientId: string;
    /**
     * The associated tenant ID.
     */
    tenantId: string;
    /**
     * The username of the logged in account.
     */
    username: string;
}

/**
 * Error used to enforce authentication after trying to retrieve a token silently.
 */
export declare class AuthenticationRequiredError extends Error {
    /**
     * The list of scopes for which the token will have access.
     */
    scopes: string[];
    /**
     * The options passed to the getToken request.
     */
    getTokenOptions?: GetTokenOptions;
    constructor(
    /**
     * Optional parameters. A message can be specified. The {@link GetTokenOptions} of the request can also be specified to more easily associate the error with the received parameters.
     */
    options: AuthenticationRequiredErrorOptions);
}

/**
 * Optional parameters to the {@link AuthenticationRequiredError}
 */
export declare interface AuthenticationRequiredErrorOptions {
    /**
     * The list of scopes for which the token will have access.
     */
    scopes: string[];
    /**
     * The options passed to the getToken request.
     */
    getTokenOptions?: GetTokenOptions;
    /**
     * The message of the error.
     */
    message?: string;
    /**
     * The underlying cause, if any, that caused the authentication to fail.
     */
    cause?: unknown;
}

/**
 * Provides options to configure how the Identity library
 * does authority validation during authentication requests
 * to Microsoft Entra ID.
 */
export declare interface AuthorityValidationOptions {
    /**
     * The field determines whether instance discovery is performed when attempting to authenticate.
     * Setting this to `true` will completely disable both instance discovery and authority validation.
     * As a result, it's crucial to ensure that the configured authority host is valid and trustworthy.
     * This functionality is intended for use in scenarios where the metadata endpoint cannot be reached, such as in private clouds or Azure Stack.
     * The process of instance discovery entails retrieving authority metadata from https://login.microsoft.com/ to validate the authority.
     */
    disableInstanceDiscovery?: boolean;
}

/**
 * Enables authentication to Microsoft Entra ID using an authorization code
 * that was obtained through the authorization code flow, described in more detail
 * in the Microsoft Entra ID documentation:
 *
 * https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow
 */
export declare class AuthorizationCodeCredential implements TokenCredential {
    private msalClient;
    private disableAutomaticAuthentication?;
    private authorizationCode;
    private redirectUri;
    private tenantId?;
    private additionallyAllowedTenantIds;
    private clientSecret?;
    /**
     * Creates an instance of AuthorizationCodeCredential with the details needed
     * to request an access token using an authentication that was obtained
     * from Microsoft Entra ID.
     *
     * It is currently necessary for the user of this credential to initiate
     * the authorization code flow to obtain an authorization code to be used
     * with this credential.  A full example of this flow is provided here:
     *
     * https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/identity/identity/samples/v2/manual/authorizationCodeSample.ts
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID or name.
     *                 'common' may be used when dealing with multi-tenant scenarios.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param clientSecret - A client secret that was generated for the App Registration
     * @param authorizationCode - An authorization code that was received from following the
     authorization code flow.  This authorization code must not
     have already been used to obtain an access token.
     * @param redirectUri - The redirect URI that was used to request the authorization code.
     Must be the same URI that is configured for the App Registration.
     * @param options - Options for configuring the client which makes the access token request.
     */
    constructor(tenantId: string | "common", clientId: string, clientSecret: string, authorizationCode: string, redirectUri: string, options?: AuthorizationCodeCredentialOptions);
    /**
     * Creates an instance of AuthorizationCodeCredential with the details needed
     * to request an access token using an authentication that was obtained
     * from Microsoft Entra ID.
     *
     * It is currently necessary for the user of this credential to initiate
     * the authorization code flow to obtain an authorization code to be used
     * with this credential.  A full example of this flow is provided here:
     *
     * https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/identity/identity/samples/v2/manual/authorizationCodeSample.ts
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID or name.
     *                 'common' may be used when dealing with multi-tenant scenarios.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param authorizationCode - An authorization code that was received from following the
     authorization code flow.  This authorization code must not
     have already been used to obtain an access token.
     * @param redirectUri - The redirect URI that was used to request the authorization code.
     Must be the same URI that is configured for the App Registration.
     * @param options - Options for configuring the client which makes the access token request.
     */
    constructor(tenantId: string | "common", clientId: string, authorizationCode: string, redirectUri: string, options?: AuthorizationCodeCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Options for the {@link AuthorizationCodeCredential}
 */
export declare interface AuthorizationCodeCredentialOptions extends MultiTenantTokenCredentialOptions, AuthorityValidationOptions {
}

/**
 * A list of known Azure authority hosts
 */
export declare enum AzureAuthorityHosts {
    /**
     * China-based Azure Authority Host
     */
    AzureChina = "https://login.chinacloudapi.cn",
    /**
     * Germany-based Azure Authority Host
     */
    AzureGermany = "https://login.microsoftonline.de",
    /**
     * US Government Azure Authority Host
     */
    AzureGovernment = "https://login.microsoftonline.us",
    /**
     * Public Cloud Azure Authority Host
     */
    AzurePublicCloud = "https://login.microsoftonline.com"
}

/**
 * This credential will use the currently logged-in user login information
 * via the Azure CLI ('az') commandline tool.
 * To do so, it will read the user access token and expire time
 * with Azure CLI command "az account get-access-token".
 */
export declare class AzureCliCredential implements TokenCredential {
    private tenantId?;
    private additionallyAllowedTenantIds;
    private timeout?;
    /**
     * Creates an instance of the {@link AzureCliCredential}.
     *
     * To use this credential, ensure that you have already logged
     * in via the 'az' tool using the command "az login" from the commandline.
     *
     * @param options - Options, to optionally allow multi-tenant requests.
     */
    constructor(options?: AzureCliCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
    /**
     * Parses the raw JSON response from the Azure CLI into a usable AccessToken object
     *
     * @param rawResponse - The raw JSON response from the Azure CLI
     * @returns An access token with the expiry time parsed from the raw response
     *
     * The expiryTime of the credential's access token, in milliseconds, is calculated as follows:
     *
     * When available, expires_on (introduced in Azure CLI v2.54.0) will be preferred. Otherwise falls back to expiresOn.
     */
    private parseRawResponse;
}

/**
 * Options for the {@link AzureCliCredential}
 */
export declare interface AzureCliCredentialOptions extends MultiTenantTokenCredentialOptions {
    /**
     * Allows specifying a tenant ID
     */
    tenantId?: string;
    /**
     * Process timeout configurable for making token requests, provided in milliseconds
     */
    processTimeoutInMs?: number;
}

/**
 * Azure Developer CLI is a command-line interface tool that allows developers to create, manage, and deploy
 * resources in Azure. It's built on top of the Azure CLI and provides additional functionality specific
 * to Azure developers. It allows users to authenticate as a user and/or a service principal against
 * <a href="https://learn.microsoft.com/entra/fundamentals/">Microsoft Entra ID</a>. The
 * AzureDeveloperCliCredential authenticates in a development environment and acquires a token on behalf of
 * the logged-in user or service principal in the Azure Developer CLI. It acts as the Azure Developer CLI logged in user or
 * service principal and executes an Azure CLI command underneath to authenticate the application against
 * Microsoft Entra ID.
 *
 * <h2> Configure AzureDeveloperCliCredential </h2>
 *
 * To use this credential, the developer needs to authenticate locally in Azure Developer CLI using one of the
 * commands below:
 *
 * <ol>
 *     <li>Run "azd auth login" in Azure Developer CLI to authenticate interactively as a user.</li>
 *     <li>Run "azd auth login --client-id clientID --client-secret clientSecret
 *     --tenant-id tenantID" to authenticate as a service principal.</li>
 * </ol>
 *
 * You may need to repeat this process after a certain time period, depending on the refresh token validity in your
 * organization. Generally, the refresh token validity period is a few weeks to a few months.
 * AzureDeveloperCliCredential will prompt you to sign in again.
 */
export declare class AzureDeveloperCliCredential implements TokenCredential {
    private tenantId?;
    private additionallyAllowedTenantIds;
    private timeout?;
    /**
     * Creates an instance of the {@link AzureDeveloperCliCredential}.
     *
     * To use this credential, ensure that you have already logged
     * in via the 'azd' tool using the command "azd auth login" from the commandline.
     *
     * @param options - Options, to optionally allow multi-tenant requests.
     */
    constructor(options?: AzureDeveloperCliCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Options for the {@link AzureDeveloperCliCredential}
 */
export declare interface AzureDeveloperCliCredentialOptions extends MultiTenantTokenCredentialOptions {
    /**
     * Allows specifying a tenant ID
     */
    tenantId?: string;
    /**
     * Process timeout configurable for making token requests, provided in milliseconds
     */
    processTimeoutInMs?: number;
}

/**
 * This credential is designed to be used in Azure Pipelines with service connections
 * as a setup for workload identity federation.
 */
export declare class AzurePipelinesCredential implements TokenCredential {
    private clientAssertionCredential;
    private identityClient;
    /**
     * AzurePipelinesCredential supports Federated Identity on Azure Pipelines through Service Connections.
     * @param tenantId - tenantId associated with the service connection
     * @param clientId - clientId associated with the service connection
     * @param serviceConnectionId - Unique ID for the service connection, as found in the querystring's resourceId key
     * @param systemAccessToken - The pipeline's <see href="https://learn.microsoft.com/azure/devops/pipelines/build/variables?view=azure-devops%26tabs=yaml#systemaccesstoken">System.AccessToken</see> value.
     * @param options - The identity client options to use for authentication.
     */
    constructor(tenantId: string, clientId: string, serviceConnectionId: string, systemAccessToken: string, options?: AzurePipelinesCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} or {@link AuthenticationError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
    /**
     *
     * @param oidcRequestUrl - oidc request url
     * @param systemAccessToken - system access token
     * @returns OIDC token from Azure Pipelines
     */
    private requestOidcToken;
}

/**
 * Optional parameters for the {@link AzurePipelinesCredential} class.
 */
export declare interface AzurePipelinesCredentialOptions extends MultiTenantTokenCredentialOptions, CredentialPersistenceOptions, AuthorityValidationOptions {
}

/**
 * This credential will use the currently logged-in user information from the
 * Azure PowerShell module. To do so, it will read the user access token and
 * expire time with Azure PowerShell command `Get-AzAccessToken -ResourceUrl {ResourceScope}`
 */
export declare class AzurePowerShellCredential implements TokenCredential {
    private tenantId?;
    private additionallyAllowedTenantIds;
    private timeout?;
    /**
     * Creates an instance of the {@link AzurePowerShellCredential}.
     *
     * To use this credential:
     * - Install the Azure Az PowerShell module with:
     *   `Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force`.
     * - You have already logged in to Azure PowerShell using the command
     * `Connect-AzAccount` from the command line.
     *
     * @param options - Options, to optionally allow multi-tenant requests.
     */
    constructor(options?: AzurePowerShellCredentialOptions);
    /**
     * Gets the access token from Azure PowerShell
     * @param resource - The resource to use when getting the token
     */
    private getAzurePowerShellAccessToken;
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If the authentication cannot be performed through PowerShell, a {@link CredentialUnavailableError} will be thrown.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Options for the {@link AzurePowerShellCredential}
 */
export declare interface AzurePowerShellCredentialOptions extends MultiTenantTokenCredentialOptions {
    /**
     * Allows specifying a tenant ID
     */
    tenantId?: string;
    /**
     * Process timeout configurable for making token requests, provided in milliseconds
     */
    processTimeoutInMs?: number;
}

/**
 * Configuration options for InteractiveBrowserCredential
 * to support WAM Broker Authentication.
 */
export declare interface BrokerAuthOptions {
    /**
     * Options to allow broker authentication when using InteractiveBrowserCredential
     *
     */
    brokerOptions?: BrokerOptions;
}

/**
 * Parameters when WAM broker authentication is disabled.
 */
export declare interface BrokerDisabledOptions {
    /**
     * If set to true, broker will be enabled for WAM support on Windows.
     */
    enabled: false;
    /**
     * If set to true, MSA account will be passed through, required for WAM authentication.
     */
    legacyEnableMsaPassthrough?: undefined;
    /**
     * Window handle for parent window, required for WAM authentication.
     */
    parentWindowHandle: undefined;
}

/**
 * Parameters when WAM broker authentication is enabled.
 */
export declare interface BrokerEnabledOptions {
    /**
     * If set to true, broker will be enabled for WAM support on Windows.
     */
    enabled: true;
    /**
     * If set to true, MSA account will be passed through, required for WAM authentication.
     */
    legacyEnableMsaPassthrough?: boolean;
    /**
     * Window handle for parent window, required for WAM authentication.
     */
    parentWindowHandle: Uint8Array;
    /**
     * If set to true, the credential will attempt to use the default broker account for authentication before falling back to interactive authentication.
     * Default is set to false.
     */
    useDefaultBrokerAccount?: boolean;
}

/**
 * Parameters that enable WAM broker authentication in the InteractiveBrowserCredential.
 */
export declare type BrokerOptions = BrokerEnabledOptions | BrokerDisabledOptions;

/**
 * Shared configuration options for browser customization
 */
export declare interface BrowserCustomizationOptions {
    /**
     * Shared configuration options for browser customization
     */
    browserCustomizationOptions?: {
        /**
         * Format for error messages for display in browser
         */
        errorMessage?: string;
        /**
         * Format for success messages for display in browser
         */
        successMessage?: string;
    };
}

/**
 * (Browser-only feature)
 * The "login style" to use in the authentication flow:
 * - "redirect" redirects the user to the authentication page and then
 *   redirects them back to the page once authentication is completed.
 * - "popup" opens a new browser window through with the redirect flow
 *   is initiated.  The user's existing browser window does not leave
 *   the current page
 */
export declare type BrowserLoginStyle = "redirect" | "popup";

/**
 * Enables multiple `TokenCredential` implementations to be tried in order
 * until one of the getToken methods returns an access token.
 */
export declare class ChainedTokenCredential implements TokenCredential {
    private _sources;
    /**
     * Creates an instance of ChainedTokenCredential using the given credentials.
     *
     * @param sources - `TokenCredential` implementations to be tried in order.
     *
     * Example usage:
     * ```ts snippet:chained_token_credential_example
     * import { ClientSecretCredential, ChainedTokenCredential } from "@azure/identity";
     *
     * const tenantId = "<tenant-id>";
     * const clientId = "<client-id>";
     * const clientSecret = "<client-secret>";
     * const anotherClientId = "<another-client-id>";
     * const anotherSecret = "<another-client-secret>";
     * const firstCredential = new ClientSecretCredential(tenantId, clientId, clientSecret);
     * const secondCredential = new ClientSecretCredential(tenantId, anotherClientId, anotherSecret);
     * const credentialChain = new ChainedTokenCredential(firstCredential, secondCredential);
     * ```
     */
    constructor(...sources: TokenCredential[]);
    /**
     * Returns the first access token returned by one of the chained
     * `TokenCredential` implementations.  Throws an {@link AggregateAuthenticationError}
     * when one or more credentials throws an {@link AuthenticationError} and
     * no credentials have returned an access token.
     *
     * This method is called automatically by Azure SDK client libraries. You may call this method
     * directly, but you must also handle token caching and token refreshing.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                `TokenCredential` implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
    private getTokenInternal;
}

/**
 * Authenticates a service principal with a JWT assertion.
 */
export declare class ClientAssertionCredential implements TokenCredential {
    private msalClient;
    private tenantId;
    private additionallyAllowedTenantIds;
    private getAssertion;
    private options;
    /**
     * Creates an instance of the ClientAssertionCredential with the details
     * needed to authenticate against Microsoft Entra ID with a client
     * assertion provided by the developer through the `getAssertion` function parameter.
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param getAssertion - A function that retrieves the assertion for the credential to use.
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId: string, clientId: string, getAssertion: () => Promise<string>, options?: ClientAssertionCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Options for the {@link ClientAssertionCredential}
 */
export declare interface ClientAssertionCredentialOptions extends MultiTenantTokenCredentialOptions, CredentialPersistenceOptions, AuthorityValidationOptions {
}

/**
 * Enables authentication to Microsoft Entra ID using a PEM-encoded
 * certificate that is assigned to an App Registration. More information
 * on how to configure certificate authentication can be found here:
 *
 * https://learn.microsoft.com/en-us/azure/active-directory/develop/active-directory-certificate-credentials#register-your-certificate-with-azure-ad
 *
 */
export declare class ClientCertificateCredential implements TokenCredential {
    private tenantId;
    private additionallyAllowedTenantIds;
    private certificateConfiguration;
    private sendCertificateChain?;
    private msalClient;
    /**
     * Creates an instance of the ClientCertificateCredential with the details
     * needed to authenticate against Microsoft Entra ID with a certificate.
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param certificatePath - The path to a PEM-encoded public/private key certificate on the filesystem.
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId: string, clientId: string, certificatePath: string, options?: ClientCertificateCredentialOptions);
    /**
     * Creates an instance of the ClientCertificateCredential with the details
     * needed to authenticate against Microsoft Entra ID with a certificate.
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param configuration - Other parameters required, including the path of the certificate on the filesystem.
     *                        If the type is ignored, we will throw the value of the path to a PEM certificate.
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId: string, clientId: string, configuration: ClientCertificatePEMCertificatePath, options?: ClientCertificateCredentialOptions);
    /**
     * Creates an instance of the ClientCertificateCredential with the details
     * needed to authenticate against Microsoft Entra ID with a certificate.
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param configuration - Other parameters required, including the PEM-encoded certificate as a string.
     *                        If the type is ignored, we will throw the value of the PEM-encoded certificate.
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId: string, clientId: string, configuration: ClientCertificatePEMCertificate, options?: ClientCertificateCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
    private buildClientCertificate;
}

/**
 * Optional parameters for the {@link ClientCertificateCredential} class.
 */
export declare interface ClientCertificateCredentialOptions extends MultiTenantTokenCredentialOptions, CredentialPersistenceOptions, AuthorityValidationOptions {
    /**
     * Option to include x5c header for SubjectName and Issuer name authorization.
     * Set this option to send base64 encoded public certificate in the client assertion header as an x5c claim
     */
    sendCertificateChain?: boolean;
}

/**
 * Required configuration options for the {@link ClientCertificateCredential}, with either the string contents of a PEM certificate, or the path to a PEM certificate.
 */
export declare type ClientCertificateCredentialPEMConfiguration = ClientCertificatePEMCertificate | ClientCertificatePEMCertificatePath;

/**
 * Required configuration options for the {@link ClientCertificateCredential}, with the string contents of a PEM certificate
 */
export declare interface ClientCertificatePEMCertificate {
    /**
     * The PEM-encoded public/private key certificate on the filesystem.
     */
    certificate: string;
    /**
     * The password for the certificate file.
     */
    certificatePassword?: string;
}

/**
 * Required configuration options for the {@link ClientCertificateCredential}, with the path to a PEM certificate.
 */
export declare interface ClientCertificatePEMCertificatePath {
    /**
     * The path to the PEM-encoded public/private key certificate on the filesystem.
     */
    certificatePath: string;
    /**
     * The password for the certificate file.
     */
    certificatePassword?: string;
}

/**
 * Enables authentication to Microsoft Entra ID using a client secret
 * that was generated for an App Registration. More information on how
 * to configure a client secret can be found here:
 *
 * https://learn.microsoft.com/entra/identity-platform/quickstart-configure-app-access-web-apis#add-credentials-to-your-web-application
 *
 */
export declare class ClientSecretCredential implements TokenCredential {
    private tenantId;
    private additionallyAllowedTenantIds;
    private msalClient;
    private clientSecret;
    /**
     * Creates an instance of the ClientSecretCredential with the details
     * needed to authenticate against Microsoft Entra ID with a client
     * secret.
     *
     * @param tenantId - The Microsoft Entra tenant (directory) ID.
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param clientSecret - A client secret that was generated for the App Registration.
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId: string, clientId: string, clientSecret: string, options?: ClientSecretCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Optional parameters for the {@link ClientSecretCredential} class.
 */
export declare interface ClientSecretCredentialOptions extends MultiTenantTokenCredentialOptions, CredentialPersistenceOptions, AuthorityValidationOptions {
}

/**
 * Shared configuration options for credentials that support persistent token
 * caching.
 */
export declare interface CredentialPersistenceOptions {
    /**
     * Options to provide to the persistence layer (if one is available) when
     * storing credentials.
     *
     * You must first register a persistence provider plugin. See the
     * `@azure/identity-cache-persistence` package on NPM.
     *
     * Example:
     *
     * ```ts snippet:credential_persistence_options_example
     * import { useIdentityPlugin, DeviceCodeCredential } from "@azure/identity";
     *
     * useIdentityPlugin(cachePersistencePlugin);
     * const credential = new DeviceCodeCredential({
     *   tokenCachePersistenceOptions: {
     *     enabled: true,
     *   },
     * });
     * ```
     */
    tokenCachePersistenceOptions?: TokenCachePersistenceOptions;
}

/**
 * This signifies that the credential that was tried in a chained credential
 * was not available to be used as the credential. Rather than treating this as
 * an error that should halt the chain, it's caught and the chain continues
 */
export declare class CredentialUnavailableError extends Error {
    constructor(message?: string, options?: {
        cause?: unknown;
    });
}

/**
 * The Error.name value of an CredentialUnavailable
 */
export declare const CredentialUnavailableErrorName = "CredentialUnavailableError";

/**
 * Provides a default {@link ChainedTokenCredential} configuration that should
 * work for most applications that use the Azure SDK.
 */
export declare class DefaultAzureCredential extends ChainedTokenCredential {
    /**
     * Creates an instance of the DefaultAzureCredential class with {@link DefaultAzureCredentialClientIdOptions}
     *
     * This credential provides a default {@link ChainedTokenCredential} configuration that should
     * work for most applications that use the Azure SDK.
     *
     * The following credential types will be tried, in order:
     *
     * - {@link EnvironmentCredential}
     * - {@link WorkloadIdentityCredential}
     * - {@link ManagedIdentityCredential}
     * - {@link AzureCliCredential}
     * - {@link AzurePowerShellCredential}
     * - {@link AzureDeveloperCliCredential}
     *
     * Consult the documentation of these credential types for more information
     * on how they attempt authentication.
     *
     * @param options - Optional parameters. See {@link DefaultAzureCredentialClientIdOptions}.
     */
    constructor(options?: DefaultAzureCredentialClientIdOptions);
    /**
     *  Creates an instance of the DefaultAzureCredential class with {@link DefaultAzureCredentialResourceIdOptions}
     *
     * This credential provides a default {@link ChainedTokenCredential} configuration that should
     * work for most applications that use the Azure SDK.
     *
     * The following credential types will be tried, in order:
     *
     * - {@link EnvironmentCredential}
     * - {@link WorkloadIdentityCredential}
     * - {@link ManagedIdentityCredential}
     * - {@link AzureCliCredential}
     * - {@link AzurePowerShellCredential}
     * - {@link AzureDeveloperCliCredential}
     *
     * Consult the documentation of these credential types for more information
     * on how they attempt authentication.
     *
     * @param options - Optional parameters. See {@link DefaultAzureCredentialResourceIdOptions}.
     */
    constructor(options?: DefaultAzureCredentialResourceIdOptions);
    /**
     * Creates an instance of the DefaultAzureCredential class with {@link DefaultAzureCredentialOptions}
     *
     * This credential provides a default {@link ChainedTokenCredential} configuration that should
     * work for most applications that use the Azure SDK.
     *
     * The following credential types will be tried, in order:
     *
     * - {@link EnvironmentCredential}
     * - {@link WorkloadIdentityCredential}
     * - {@link ManagedIdentityCredential}
     * - {@link AzureCliCredential}
     * - {@link AzurePowerShellCredential}
     * - {@link AzureDeveloperCliCredential}
     *
     * Consult the documentation of these credential types for more information
     * on how they attempt authentication.
     *
     * @param options - Optional parameters. See {@link DefaultAzureCredentialOptions}.
     */
    constructor(options?: DefaultAzureCredentialOptions);
}

/**
 * Provides options to configure the {@link DefaultAzureCredential} class.
 * This variation supports `managedIdentityClientId` and not `managedIdentityResourceId`, since only one of both is supported.
 */
export declare interface DefaultAzureCredentialClientIdOptions extends DefaultAzureCredentialOptions {
    /**
     * Optionally pass in a user assigned client ID to be used by the {@link ManagedIdentityCredential}.
     * This client ID can also be passed through to the {@link ManagedIdentityCredential} through the environment variable: AZURE_CLIENT_ID.
     */
    managedIdentityClientId?: string;
    /**
     * Optionally pass in a user assigned client ID to be used by the {@link WorkloadIdentityCredential}.
     * This client ID can also be passed through to the {@link WorkloadIdentityCredential} through the environment variable: AZURE_CLIENT_ID.
     */
    workloadIdentityClientId?: string;
}

/**
 * Provides options to configure the {@link DefaultAzureCredential} class.
 */
export declare interface DefaultAzureCredentialOptions extends MultiTenantTokenCredentialOptions, AuthorityValidationOptions {
    /**
     * Optionally pass in a Tenant ID to be used as part of the credential.
     * By default it may use a generic tenant ID depending on the underlying credential.
     */
    tenantId?: string;
    /**
     * Timeout configurable for making token requests for developer credentials, namely, {@link AzurePowershellCredential},
     * {@link AzureDeveloperCliCredential} and {@link AzureCliCredential}.
     * Process timeout for credentials should be provided in milliseconds.
     */
    processTimeoutInMs?: number;
}

/**
 * Provides options to configure the {@link DefaultAzureCredential} class.
 * This variation supports `managedIdentityResourceId` and not `managedIdentityClientId`, since only one of both is supported.
 */
export declare interface DefaultAzureCredentialResourceIdOptions extends DefaultAzureCredentialOptions {
    /**
     * Optionally pass in a resource ID to be used by the {@link ManagedIdentityCredential}.
     * In scenarios such as when user assigned identities are created using an ARM template,
     * where the resource Id of the identity is known but the client Id can't be known ahead of time,
     * this parameter allows programs to use these user assigned identities
     * without having to first determine the client Id of the created identity.
     */
    managedIdentityResourceId: string;
}

/**
 * Deserializes a previously serialized authentication record from a string into an object.
 *
 * The input string must contain the following properties:
 *
 * - "authority"
 * - "homeAccountId"
 * - "clientId"
 * - "tenantId"
 * - "username"
 * - "version"
 *
 * If the version we receive is unsupported, an error will be thrown.
 *
 * At the moment, the only available version is: "1.0", which is always set when the authentication record is serialized.
 *
 * @param serializedRecord - Authentication record previously serialized into string.
 * @returns AuthenticationRecord.
 */
export declare function deserializeAuthenticationRecord(serializedRecord: string): AuthenticationRecord;

/**
 * Enables authentication to Microsoft Entra ID using a device code
 * that the user can enter into https://microsoft.com/devicelogin.
 */
export declare class DeviceCodeCredential implements TokenCredential {
    private tenantId?;
    private additionallyAllowedTenantIds;
    private disableAutomaticAuthentication?;
    private msalClient;
    private userPromptCallback;
    /**
     * Creates an instance of DeviceCodeCredential with the details needed
     * to initiate the device code authorization flow with Microsoft Entra ID.
     *
     * A message will be logged, giving users a code that they can use to authenticate once they go to https://microsoft.com/devicelogin
     *
     * Developers can configure how this message is shown by passing a custom `userPromptCallback`:
     *
     * ```ts snippet:device_code_credential_example
     * import { DeviceCodeCredential } from "@azure/identity";
     *
     * const credential = new DeviceCodeCredential({
     *   tenantId: process.env.AZURE_TENANT_ID,
     *   clientId: process.env.AZURE_CLIENT_ID,
     *   userPromptCallback: (info) => {
     *     console.log("CUSTOMIZED PROMPT CALLBACK", info.message);
     *   },
     * });
     * ```
     *
     * @param options - Options for configuring the client which makes the authentication requests.
     */
    constructor(options?: DeviceCodeCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the user provided the option `disableAutomaticAuthentication`,
     * once the token can't be retrieved silently,
     * this method won't attempt to request user interaction to retrieve the token.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the token can't be retrieved silently, this method will always generate a challenge for the user.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                  TokenCredential implementation might make.
     */
    authenticate(scopes: string | string[], options?: GetTokenOptions): Promise<AuthenticationRecord | undefined>;
}

/**
 * Defines options for the InteractiveBrowserCredential class for Node.js.
 */
export declare interface DeviceCodeCredentialOptions extends InteractiveCredentialOptions, CredentialPersistenceOptions {
    /**
     * The Microsoft Entra tenant (directory) ID.
     */
    tenantId?: string;
    /**
     * Client ID of the Microsoft Entra application that users will sign into.
     * It is recommended that developers register their applications and assign appropriate roles.
     * For more information, visit https://aka.ms/identity/AppRegistrationAndRoleAssignment.
     * If not specified, users will authenticate to an Azure development application,
     * which is not recommended for production scenarios.
     */
    clientId?: string;
    /**
     * A callback function that will be invoked to show {@link DeviceCodeInfo} to the user.
     * If left unassigned, we will automatically log the device code information
     * and the authentication instructions in the console.
     */
    userPromptCallback?: DeviceCodePromptCallback;
}

/**
 * Provides the user code and verification URI where the code must be
 * entered.  Also provides a message to display to the user which
 * contains an instruction with these details.
 */
export declare interface DeviceCodeInfo {
    /**
     * The device code that the user must enter into the verification page.
     */
    userCode: string;
    /**
     * The verification URI to which the user must navigate to enter the device
     * code.
     */
    verificationUri: string;
    /**
     * A message that may be shown to the user to instruct them on how to enter
     * the device code in the page specified by the verification URI.
     */
    message: string;
}

/**
 * Defines the signature of a callback which will be passed to
 * DeviceCodeCredential for the purpose of displaying authentication
 * details to the user.
 */
export declare type DeviceCodePromptCallback = (deviceCodeInfo: DeviceCodeInfo) => void;

/**
 * Enables authentication to Microsoft Entra ID using a client secret or certificate, or as a user
 * with a username and password.
 */
export declare class EnvironmentCredential implements TokenCredential {
    private _credential?;
    /**
     * Creates an instance of the EnvironmentCredential class and decides what credential to use depending on the available environment variables.
     *
     * Required environment variables:
     * - `AZURE_TENANT_ID`: The Microsoft Entra tenant (directory) ID.
     * - `AZURE_CLIENT_ID`: The client (application) ID of an App Registration in the tenant.
     *
     * If setting the AZURE_TENANT_ID, then you can also set the additionally allowed tenants
     * - `AZURE_ADDITIONALLY_ALLOWED_TENANTS`: For multi-tenant applications, specifies additional tenants for which the credential may acquire tokens with a single semicolon delimited string. Use * to allow all tenants.
     *
     * Environment variables used for client credential authentication:
     * - `AZURE_CLIENT_SECRET`: A client secret that was generated for the App Registration.
     * - `AZURE_CLIENT_CERTIFICATE_PATH`: The path to a PEM certificate to use during the authentication, instead of the client secret.
     * - `AZURE_CLIENT_CERTIFICATE_PASSWORD`: (optional) password for the certificate file.
     * - `AZURE_CLIENT_SEND_CERTIFICATE_CHAIN`: (optional) indicates that the certificate chain should be set in x5c header to support subject name / issuer based authentication.
     *
     * Alternatively, users can provide environment variables for username and password authentication:
     * - `AZURE_USERNAME`: Username to authenticate with.
     * - `AZURE_PASSWORD`: Password to authenticate with.
     *
     * If the environment variables required to perform the authentication are missing, a {@link CredentialUnavailableError} will be thrown.
     * If the authentication fails, or if there's an unknown error, an {@link AuthenticationError} will be thrown.
     *
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(options?: EnvironmentCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - Optional parameters. See {@link GetTokenOptions}.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Enables authentication to Microsoft Entra ID depending on the available environment variables.
 * Defines options for the EnvironmentCredential class.
 */
export declare interface EnvironmentCredentialOptions extends MultiTenantTokenCredentialOptions, AuthorityValidationOptions {
}

/**
 * See the official documentation for more details:
 *
 * https://learn.microsoft.com/en-us/azure/active-directory/develop/v1-protocols-oauth-code#error-response-1
 *
 * NOTE: This documentation is for v1 OAuth support but the same error
 * response details still apply to v2.
 */
export declare interface ErrorResponse {
    /**
     * The string identifier for the error.
     */
    error: string;
    /**
     * The error's description.
     */
    errorDescription: string;
    /**
     * An array of codes pertaining to the error(s) that occurred.
     */
    errorCodes?: number[];
    /**
     * The timestamp at which the error occurred.
     */
    timestamp?: string;
    /**
     * The trace identifier for this error occurrence.
     */
    traceId?: string;
    /**
     * The correlation ID to be used for tracking the source of the error.
     */
    correlationId?: string;
}

/**
 * Returns a callback that provides a bearer token.
 * For example, the bearer token can be used to authenticate a request as follows:
 * ```ts snippet:token_provider_example
 * import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
 * import { createPipelineRequest } from "@azure/core-rest-pipeline";
 *
 * const credential = new DefaultAzureCredential();
 * const scope = "https://cognitiveservices.azure.com/.default";
 * const getAccessToken = getBearerTokenProvider(credential, scope);
 * const token = await getAccessToken();
 * // usage
 * const request = createPipelineRequest({ url: "https://example.com" });
 * request.headers.set("Authorization", `Bearer ${token}`);
 * ```
 *
 * @param credential - The credential used to authenticate the request.
 * @param scopes - The scopes required for the bearer token.
 * @param options - Options to configure the token provider.
 * @returns a callback that provides a bearer token.
 */
export declare function getBearerTokenProvider(credential: TokenCredential, scopes: string | string[], options?: GetBearerTokenProviderOptions): () => Promise<string>;

/**
 * The options to configure the token provider.
 */
export declare interface GetBearerTokenProviderOptions {
    /** The abort signal to abort requests to get tokens */
    abortSignal?: AbortSignal;
    /** The tracing options for the requests to get tokens */
    tracingOptions?: {
        /**
         * Tracing Context for the current request to get a token.
         */
        tracingContext?: TracingContext;
    };
}

/**
 * Returns a new instance of the {@link DefaultAzureCredential}.
 */
export declare function getDefaultAzureCredential(): TokenCredential;

export { GetTokenOptions }

/**
 * The type of an Azure Identity plugin, a function accepting a plugin
 * context.
 */
export declare type IdentityPlugin = (context: unknown) => void;

/**
 * Enables authentication to Microsoft Entra ID inside of the web browser
 * using the interactive login flow.
 */
export declare class InteractiveBrowserCredential implements TokenCredential {
    private tenantId?;
    private additionallyAllowedTenantIds;
    private msalClient;
    private disableAutomaticAuthentication?;
    private browserCustomizationOptions;
    private loginHint?;
    /**
     * Creates an instance of InteractiveBrowserCredential with the details needed.
     *
     * This credential uses the [Authorization Code Flow](https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow).
     * On Node.js, it will open a browser window while it listens for a redirect response from the authentication service.
     * On browsers, it authenticates via popups. The `loginStyle` optional parameter can be set to `redirect` to authenticate by redirecting the user to an Azure secure login page, which then will redirect the user back to the web application where the authentication started.
     *
     * For Node.js, if a `clientId` is provided, the Microsoft Entra application will need to be configured to have a "Mobile and desktop applications" redirect endpoint.
     * Follow our guide on [setting up Redirect URIs for Desktop apps that calls to web APIs](https://learn.microsoft.com/entra/identity-platform/scenario-desktop-app-registration#redirect-uris).
     *
     * @param options - Options for configuring the client which makes the authentication requests.
     */
    constructor(options: InteractiveBrowserCredentialNodeOptions | InteractiveBrowserCredentialInBrowserOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the user provided the option `disableAutomaticAuthentication`,
     * once the token can't be retrieved silently,
     * this method won't attempt to request user interaction to retrieve the token.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the token can't be retrieved silently, this method will always generate a challenge for the user.
     *
     * On Node.js, this credential has [Proof Key for Code Exchange (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636) enabled by default.
     * PKCE is a security feature that mitigates authentication code interception attacks.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                  TokenCredential implementation might make.
     */
    authenticate(scopes: string | string[], options?: GetTokenOptions): Promise<AuthenticationRecord | undefined>;
}

/**
 * Defines the common options for the InteractiveBrowserCredential class.
 */
export declare interface InteractiveBrowserCredentialInBrowserOptions extends InteractiveCredentialOptions {
    /**
     * Gets the redirect URI of the application. This should be same as the value
     * in the application registration portal.  Defaults to `window.location.href`.
     * This field is no longer required for Node.js.
     */
    redirectUri?: string | (() => string);
    /**
     * The Microsoft Entra tenant (directory) ID.
     */
    tenantId?: string;
    /**
     * The Client ID of the Microsoft Entra application that users will sign into.
     * This parameter is required on the browser.
     * Developers need to register their applications and assign appropriate roles.
     * For more information, visit https://aka.ms/identity/AppRegistrationAndRoleAssignment.
     */
    clientId: string;
    /**
     * Specifies whether a redirect or a popup window should be used to
     * initiate the user authentication flow. Possible values are "redirect"
     * or "popup" (default) for browser and "popup" (default) for node.
     *
     */
    loginStyle?: BrowserLoginStyle;
    /**
     * loginHint allows a user name to be pre-selected for interactive logins.
     * Setting this option skips the account selection prompt and immediately attempts to login with the specified account.
     */
    loginHint?: string;
}

/**
 * Defines the common options for the InteractiveBrowserCredential class.
 */
export declare interface InteractiveBrowserCredentialNodeOptions extends InteractiveCredentialOptions, CredentialPersistenceOptions, BrowserCustomizationOptions, BrokerAuthOptions {
    /**
     * Gets the redirect URI of the application. This should be same as the value
     * in the application registration portal.  Defaults to `window.location.href`.
     * This field is no longer required for Node.js.
     */
    redirectUri?: string | (() => string);
    /**
     * The Microsoft Entra tenant (directory) ID.
     */
    tenantId?: string;
    /**
     * The Client ID of the Microsoft Entra application that users will sign into.
     * It is recommended that developers register their applications and assign appropriate roles.
     * For more information, visit https://aka.ms/identity/AppRegistrationAndRoleAssignment.
     * If not specified, users will authenticate to an Azure development application,
     * which is not recommended for production scenarios.
     */
    clientId?: string;
    /**
     * loginHint allows a user name to be pre-selected for interactive logins.
     * Setting this option skips the account selection prompt and immediately attempts to login with the specified account.
     */
    loginHint?: string;
}

/**
 * Common constructor options for the Identity credentials that requires user interaction.
 */
export declare interface InteractiveCredentialOptions extends MultiTenantTokenCredentialOptions, AuthorityValidationOptions {
    /**
     * Result of a previous authentication that can be used to retrieve the cached credentials of each individual account.
     * This is necessary to provide in case the application wants to work with more than one account per
     * Client ID and Tenant ID pair.
     *
     * This record can be retrieved by calling to the credential's `authenticate()` method, as follows:
     *
     *     const authenticationRecord = await credential.authenticate();
     *
     */
    authenticationRecord?: AuthenticationRecord;
    /**
     * Makes getToken throw if a manual authentication is necessary.
     * Developers will need to call to `authenticate()` to control when to manually authenticate.
     */
    disableAutomaticAuthentication?: boolean;
}

/**
 * The AzureLogger used for all clients within the identity package
 */
export declare const logger: AzureLogger;

/**
 * Attempts authentication using a managed identity available at the deployment environment.
 * This authentication type works in Azure VMs, App Service instances, Azure Functions applications,
 * Azure Kubernetes Services, Azure Service Fabric instances and inside of the Azure Cloud Shell.
 *
 * More information about configuring managed identities can be found here:
 * https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview
 */
export declare class ManagedIdentityCredential implements TokenCredential {
    private implProvider;
    /**
     * Creates an instance of ManagedIdentityCredential with the client ID of a
     * user-assigned identity, or app registration (when working with AKS pod-identity).
     *
     * @param clientId - The client ID of the user-assigned identity, or app registration (when working with AKS pod-identity).
     * @param options - Options for configuring the client which makes the access token request.
     */
    constructor(clientId: string, options?: TokenCredentialOptions);
    /**
     * Creates an instance of ManagedIdentityCredential with a client ID
     *
     * @param options - Options for configuring the client which makes the access token request.
     */
    constructor(options?: ManagedIdentityCredentialClientIdOptions);
    /**
     * Creates an instance of ManagedIdentityCredential with a resource ID
     *
     * @param options - Options for configuring the resource which makes the access token request.
     */
    constructor(options?: ManagedIdentityCredentialResourceIdOptions);
    /**
     * Creates an instance of ManagedIdentityCredential with an object ID
     *
     * @param options - Options for configuring the resource which makes the access token request.
     */
    constructor(options?: ManagedIdentityCredentialObjectIdOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     * If an unexpected error occurs, an {@link AuthenticationError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Options to send on the {@link ManagedIdentityCredential} constructor.
 * This variation supports `clientId` and not `resourceId`, since only one of both is supported.
 */
export declare interface ManagedIdentityCredentialClientIdOptions extends TokenCredentialOptions {
    /**
     * The client ID of the user - assigned identity, or app registration(when working with AKS pod - identity).
     */
    clientId?: string;
}

/**
 * Options to send on the {@link ManagedIdentityCredential} constructor.
 * This variation supports `objectId` as a constructor argument.
 */
export declare interface ManagedIdentityCredentialObjectIdOptions extends TokenCredentialOptions {
    /**
     * Allows specifying the object ID of the underlying service principal used to authenticate a user-assigned managed identity.
     * This is an alternative to providing a client ID or resource ID and is not required for system-assigned managed identities.
     */
    objectId: string;
}

/**
 * Options to send on the {@link ManagedIdentityCredential} constructor.
 * This variation supports `resourceId` and not `clientId`, since only one of both is supported.
 */
export declare interface ManagedIdentityCredentialResourceIdOptions extends TokenCredentialOptions {
    /**
     * Allows specifying a custom resource Id.
     * In scenarios such as when user assigned identities are created using an ARM template,
     * where the resource Id of the identity is known but the client Id can't be known ahead of time,
     * this parameter allows programs to use these user assigned identities
     * without having to first determine the client Id of the created identity.
     */
    resourceId: string;
}

/**
 * Options for multi-tenant applications which allows for additionally allowed tenants.
 */
export declare interface MultiTenantTokenCredentialOptions extends TokenCredentialOptions {
    /**
     * For multi-tenant applications, specifies additional tenants for which the credential may acquire tokens.
     * Add the wildcard value "*" to allow the credential to acquire tokens for any tenant the application is installed.
     */
    additionallyAllowedTenants?: string[];
}

/**
 * Enables authentication to Microsoft Entra ID using the [On Behalf Of flow](https://learn.microsoft.com/entra/identity-platform/v2-oauth2-on-behalf-of-flow).
 */
export declare class OnBehalfOfCredential implements TokenCredential {
    private tenantId;
    private additionallyAllowedTenantIds;
    private msalClient;
    private sendCertificateChain?;
    private certificatePath?;
    private clientSecret?;
    private userAssertionToken;
    private clientAssertion?;
    /**
     * Creates an instance of the {@link OnBehalfOfCredential} with the details
     * needed to authenticate against Microsoft Entra ID with path to a PEM certificate,
     * and an user assertion.
     *
     * Example using the `KeyClient` from [\@azure/keyvault-keys](https://www.npmjs.com/package/\@azure/keyvault-keys):
     *
     * ```ts snippet:on_behalf_of_credential_pem_example
     * import { OnBehalfOfCredential } from "@azure/identity";
     * import { KeyClient } from "@azure/keyvault-keys";
     *
     * const tokenCredential = new OnBehalfOfCredential({
     *   tenantId: "tenant-id",
     *   clientId: "client-id",
     *   certificatePath: "/path/to/certificate.pem",
     *   userAssertionToken: "access-token",
     * });
     * const client = new KeyClient("vault-url", tokenCredential);
     * await client.getKey("key-name");
     * ```
     *
     * @param options - Optional parameters, generally common across credentials.
     */
    constructor(options: OnBehalfOfCredentialCertificateOptions & MultiTenantTokenCredentialOptions & CredentialPersistenceOptions);
    /**
     * Creates an instance of the {@link OnBehalfOfCredential} with the details
     * needed to authenticate against Microsoft Entra ID with a client
     * secret and an user assertion.
     *
     * Example using the `KeyClient` from [\@azure/keyvault-keys](https://www.npmjs.com/package/\@azure/keyvault-keys):
     *
     * ```ts snippet:on_behalf_of_credential_secret_example
     * import { OnBehalfOfCredential } from "@azure/identity";
     * import { KeyClient } from "@azure/keyvault-keys";
     *
     * const tokenCredential = new OnBehalfOfCredential({
     *   tenantId: "tenant-id",
     *   clientId: "client-id",
     *   clientSecret: "client-secret",
     *   userAssertionToken: "access-token",
     * });
     * const client = new KeyClient("vault-url", tokenCredential);
     * await client.getKey("key-name");
     * ```
     *
     * @param options - Optional parameters, generally common across credentials.
     */
    constructor(options: OnBehalfOfCredentialSecretOptions & MultiTenantTokenCredentialOptions & CredentialPersistenceOptions);
    /**
     * Creates an instance of the {@link OnBehalfOfCredential} with the details
     * needed to authenticate against Microsoft Entra ID with a client `getAssertion`
     * and an user assertion.
     *
     * Example using the `KeyClient` from [\@azure/keyvault-keys](https://www.npmjs.com/package/\@azure/keyvault-keys):
     *
     * ```ts snippet:on_behalf_of_credential_assertion_example
     * import { OnBehalfOfCredential } from "@azure/identity";
     * import { KeyClient } from "@azure/keyvault-keys";
     *
     * const tokenCredential = new OnBehalfOfCredential({
     *   tenantId: "tenant-id",
     *   clientId: "client-id",
     *   getAssertion: () => {
     *     return Promise.resolve("my-jwt");
     *   },
     *   userAssertionToken: "access-token",
     * });
     * const client = new KeyClient("vault-url", tokenCredential);
     * await client.getKey("key-name");
     * ```
     *
     * @param options - Optional parameters, generally common across credentials.
     */
    constructor(options: OnBehalfOfCredentialAssertionOptions & MultiTenantTokenCredentialOptions & CredentialPersistenceOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure the underlying network requests.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
    private buildClientCertificate;
    private parseCertificate;
}

/**
 * Defines the parameters to authenticate the {@link OnBehalfOfCredential} with an assertion.
 */
export declare interface OnBehalfOfCredentialAssertionOptions {
    /**
     * The Microsoft Entra tenant (directory) ID.
     */
    tenantId: string;
    /**
     * The client (application) ID of an App Registration in the tenant.
     */
    clientId: string;
    /**
     * A function that retrieves the client assertion for the credential to use
     */
    getAssertion: () => Promise<string>;
    /**
     * The user assertion for the On-Behalf-Of flow.
     */
    userAssertionToken: string;
}

/**
 * Defines the parameters to authenticate the {@link OnBehalfOfCredential} with a certificate.
 */
export declare interface OnBehalfOfCredentialCertificateOptions {
    /**
     * The Microsoft Entra tenant (directory) ID.
     */
    tenantId: string;
    /**
     * The client (application) ID of an App Registration in the tenant.
     */
    clientId: string;
    /**
     * The path to a PEM-encoded public/private key certificate on the filesystem.
     */
    certificatePath: string;
    /**
     * The user assertion for the On-Behalf-Of flow.
     */
    userAssertionToken: string;
    /**
     * Option to include x5c header for SubjectName and Issuer name authorization.
     * Set this option to send base64 encoded public certificate in the client assertion header as an x5c claim
     */
    sendCertificateChain?: boolean;
}

/**
 * Optional parameters for the {@link OnBehalfOfCredential} class.
 */
export declare type OnBehalfOfCredentialOptions = (OnBehalfOfCredentialSecretOptions | OnBehalfOfCredentialCertificateOptions | OnBehalfOfCredentialAssertionOptions) & MultiTenantTokenCredentialOptions & CredentialPersistenceOptions & AuthorityValidationOptions;

/**
 * Defines the parameters to authenticate the {@link OnBehalfOfCredential} with a secret.
 */
export declare interface OnBehalfOfCredentialSecretOptions {
    /**
     * The Microsoft Entra tenant (directory) ID.
     */
    tenantId: string;
    /**
     * The client (application) ID of an App Registration in the tenant.
     */
    clientId: string;
    /**
     * A client secret that was generated for the App Registration.
     */
    clientSecret: string;
    /**
     * The user assertion for the On-Behalf-Of flow.
     */
    userAssertionToken: string;
}

/**
 * Serializes an `AuthenticationRecord` into a string.
 *
 * The output of a serialized authentication record will contain the following properties:
 *
 * - "authority"
 * - "homeAccountId"
 * - "clientId"
 * - "tenantId"
 * - "username"
 * - "version"
 *
 * To later convert this string to a serialized `AuthenticationRecord`, please use the exported function `deserializeAuthenticationRecord()`.
 */
export declare function serializeAuthenticationRecord(record: AuthenticationRecord): string;

/**
 * Parameters that enable token cache persistence in the Identity credentials.
 */
export declare interface TokenCachePersistenceOptions {
    /**
     * If set to true, persistent token caching will be enabled for this credential instance.
     */
    enabled: boolean;
    /**
     * Unique identifier for the persistent token cache.
     *
     * Based on this identifier, the persistence file will be located in any of the following places:
     * - Darwin: '/Users/user/.IdentityService/<name>'
     * - Windows 8+: 'C:\\Users\\user\\AppData\\Local\\.IdentityService\\<name>'
     * - Linux: '/home/user/.IdentityService/<name>'
     */
    name?: string;
    /**
     * If set to true, the cache will be stored without encryption if no OS level user encryption is available.
     * When set to false, the PersistentTokenCache will throw an error if no OS level user encryption is available.
     */
    unsafeAllowUnencryptedStorage?: boolean;
}

export { TokenCredential }

/**
 * Provides options to configure how the Identity library makes authentication
 * requests to Microsoft Entra ID.
 */
export declare interface TokenCredentialOptions extends CommonClientOptions {
    /**
     * The authority host to use for authentication requests.
     * Possible values are available through {@link AzureAuthorityHosts}.
     * The default is "https://login.microsoftonline.com".
     */
    authorityHost?: string;
    /**
     * Allows users to configure settings for logging policy options, allow logging account information and personally identifiable information for customer support.
     */
    loggingOptions?: LogPolicyOptions & {
        /**
         * Allows logging account information once the authentication flow succeeds.
         */
        allowLoggingAccountIdentifiers?: boolean;
        /**
         * Allows logging personally identifiable information for customer support.
         */
        enableUnsafeSupportLogging?: boolean;
    };
}

/**
 * Extend Azure Identity with additional functionality. Pass a plugin from
 * a plugin package, such as:
 *
 * - `@azure/identity-cache-persistence`: provides persistent token caching
 * - `@azure/identity-vscode`: provides the dependencies of
 *   `VisualStudioCodeCredential` and enables it
 *
 * Example:
 *
 * ```ts snippet:consumer_example
 * import { useIdentityPlugin, DeviceCodeCredential } from "@azure/identity";
 *
 * useIdentityPlugin(cachePersistencePlugin);
 * // The plugin has the capability to extend `DeviceCodeCredential` and to
 * // add middleware to the underlying credentials, such as persistence.
 * const credential = new DeviceCodeCredential({
 *   tokenCachePersistenceOptions: {
 *     enabled: true,
 *   },
 * });
 * ```
 *
 * @param plugin - the plugin to register
 */
export declare function useIdentityPlugin(plugin: IdentityPlugin): void;

/**
 * Enables authentication to Microsoft Entra ID with a user's
 * username and password. This credential requires a high degree of
 * trust so you should only use it when other, more secure credential
 * types can't be used.
 */
export declare class UsernamePasswordCredential implements TokenCredential {
    private tenantId;
    private additionallyAllowedTenantIds;
    private msalClient;
    private username;
    private password;
    /**
     * Creates an instance of the UsernamePasswordCredential with the details
     * needed to authenticate against Microsoft Entra ID with a username
     * and password.
     *
     * @param tenantId - The Microsoft Entra tenant (directory).
     * @param clientId - The client (application) ID of an App Registration in the tenant.
     * @param username - The user account's e-mail address (user name).
     * @param password - The user account's account password
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(tenantId: string, clientId: string, username: string, password: string, options?: UsernamePasswordCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * If the user provided the option `disableAutomaticAuthentication`,
     * once the token can't be retrieved silently,
     * this method won't attempt to request user interaction to retrieve the token.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Defines options for the {@link UsernamePasswordCredential} class.
 */
export declare interface UsernamePasswordCredentialOptions extends MultiTenantTokenCredentialOptions, CredentialPersistenceOptions, AuthorityValidationOptions {
}

/**
 * Connects to Azure using the credential provided by the VSCode extension 'Azure Account'.
 * Once the user has logged in via the extension, this credential can share the same refresh token
 * that is cached by the extension.
 *
 * It's a [known issue](https://github.com/Azure/azure-sdk-for-js/issues/20500) that this credential doesn't
 * work with [Azure Account extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account)
 * versions newer than **0.9.11**. A long-term fix to this problem is in progress. In the meantime, consider
 * authenticating with {@link AzureCliCredential}.
 */
export declare class VisualStudioCodeCredential implements TokenCredential {
    private identityClient;
    private tenantId;
    private additionallyAllowedTenantIds;
    private cloudName;
    /**
     * Creates an instance of VisualStudioCodeCredential to use for automatically authenticating via VSCode.
     *
     * **Note**: `VisualStudioCodeCredential` is provided by a plugin package:
     * `@azure/identity-vscode`. If this package is not installed and registered
     * using the plugin API (`useIdentityPlugin`), then authentication using
     * `VisualStudioCodeCredential` will not be available.
     *
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(options?: VisualStudioCodeCredentialOptions);
    /**
     * Runs preparations for any further getToken request.
     */
    private prepare;
    /**
     * The promise of the single preparation that will be executed at the first getToken request for an instance of this class.
     */
    private preparePromise;
    /**
     * Runs preparations for any further getToken, but only once.
     */
    private prepareOnce;
    /**
     * Returns the token found by searching VSCode's authentication cache or
     * returns null if no token could be found.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                `TokenCredential` implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken>;
}

/**
 * Provides options to configure the Visual Studio Code credential.
 */
export declare interface VisualStudioCodeCredentialOptions extends MultiTenantTokenCredentialOptions {
    /**
     * Optionally pass in a Tenant ID to be used as part of the credential
     */
    tenantId?: string;
}

/**
 * Workload Identity authentication is a feature in Azure that allows applications running on virtual machines (VMs)
 * to access other Azure resources without the need for a service principal or managed identity. With Workload Identity
 * authentication, applications authenticate themselves using their own identity, rather than using a shared service
 * principal or managed identity. Under the hood, Workload Identity authentication uses the concept of Service Account
 * Credentials (SACs), which are automatically created by Azure and stored securely in the VM. By using Workload
 * Identity authentication, you can avoid the need to manage and rotate service principals or managed identities for
 * each application on each VM. Additionally, because SACs are created automatically and managed by Azure, you don't
 * need to worry about storing and securing sensitive credentials themselves.
 * The WorkloadIdentityCredential supports Microsoft Entra Workload ID authentication on Azure Kubernetes and acquires
 * a token using the SACs available in the Azure Kubernetes environment.
 * Refer to <a href="https://learn.microsoft.com/azure/aks/workload-identity-overview">Microsoft Entra
 * Workload ID</a> for more information.
 */
export declare class WorkloadIdentityCredential implements TokenCredential {
    private client;
    private azureFederatedTokenFileContent;
    private cacheDate;
    private federatedTokenFilePath;
    /**
     * WorkloadIdentityCredential supports Microsoft Entra Workload ID on Kubernetes.
     *
     * @param options - The identity client options to use for authentication.
     */
    constructor(options?: WorkloadIdentityCredentialOptions);
    /**
     * Authenticates with Microsoft Entra ID and returns an access token if successful.
     * If authentication fails, a {@link CredentialUnavailableError} will be thrown with the details of the failure.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - The options used to configure any requests this
     *                TokenCredential implementation might make.
     */
    getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken | null>;
    private readFileContents;
}

/**
 * Options for the {@link WorkloadIdentityCredential}
 */
export declare interface WorkloadIdentityCredentialOptions extends MultiTenantTokenCredentialOptions, AuthorityValidationOptions {
    /**
     * ID of the application's Microsoft Entra tenant. Also called its directory ID.
     */
    tenantId?: string;
    /**
     * The client ID of a Microsoft Entra app registration.
     */
    clientId?: string;
    /**
     * The path to a file containing a Kubernetes service account token that authenticates the identity.
     */
    tokenFilePath?: string;
}

export { }
