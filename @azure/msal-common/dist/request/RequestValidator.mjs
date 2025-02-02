/*! @azure/msal-common v15.0.1 2025-01-15 */
'use strict';
import { createClientConfigurationError } from '../error/ClientConfigurationError.mjs';
import { CodeChallengeMethodValues, PromptValue } from '../utils/Constants.mjs';
import { redirectUriEmpty, invalidPromptValue, invalidClaims, pkceParamsMissing, invalidCodeChallengeMethod } from '../error/ClientConfigurationErrorCodes.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Validates server consumable params from the "request" objects
 */
class RequestValidator {
    /**
     * Utility to check if the `redirectUri` in the request is a non-null value
     * @param redirectUri
     */
    static validateRedirectUri(redirectUri) {
        if (!redirectUri) {
            throw createClientConfigurationError(redirectUriEmpty);
        }
    }
    /**
     * Utility to validate prompt sent by the user in the request
     * @param prompt
     */
    static validatePrompt(prompt) {
        const promptValues = [];
        for (const value in PromptValue) {
            promptValues.push(PromptValue[value]);
        }
        if (promptValues.indexOf(prompt) < 0) {
            throw createClientConfigurationError(invalidPromptValue);
        }
    }
    static validateClaims(claims) {
        try {
            JSON.parse(claims);
        }
        catch (e) {
            throw createClientConfigurationError(invalidClaims);
        }
    }
    /**
     * Utility to validate code_challenge and code_challenge_method
     * @param codeChallenge
     * @param codeChallengeMethod
     */
    static validateCodeChallengeParams(codeChallenge, codeChallengeMethod) {
        if (!codeChallenge || !codeChallengeMethod) {
            throw createClientConfigurationError(pkceParamsMissing);
        }
        else {
            this.validateCodeChallengeMethod(codeChallengeMethod);
        }
    }
    /**
     * Utility to validate code_challenge_method
     * @param codeChallengeMethod
     */
    static validateCodeChallengeMethod(codeChallengeMethod) {
        if ([
            CodeChallengeMethodValues.PLAIN,
            CodeChallengeMethodValues.S256,
        ].indexOf(codeChallengeMethod) < 0) {
            throw createClientConfigurationError(invalidCodeChallengeMethod);
        }
    }
}

export { RequestValidator };
//# sourceMappingURL=RequestValidator.mjs.map
