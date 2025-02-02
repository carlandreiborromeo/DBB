"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttlingRetryPolicyName = void 0;
exports.throttlingRetryPolicy = throttlingRetryPolicy;
const throttlingRetryStrategy_js_1 = require("../retryStrategies/throttlingRetryStrategy.js");
const retryPolicy_js_1 = require("./retryPolicy.js");
const constants_js_1 = require("../constants.js");
/**
 * Name of the {@link throttlingRetryPolicy}
 */
exports.throttlingRetryPolicyName = "throttlingRetryPolicy";
/**
 * A policy that retries when the server sends a 429 response with a Retry-After header.
 *
 * To learn more, please refer to
 * https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-request-limits,
 * https://docs.microsoft.com/en-us/azure/azure-subscription-service-limits and
 * https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshooting-throttling-errors
 *
 * @param options - Options that configure retry logic.
 */
function throttlingRetryPolicy(options = {}) {
    var _a;
    return {
        name: exports.throttlingRetryPolicyName,
        sendRequest: (0, retryPolicy_js_1.retryPolicy)([(0, throttlingRetryStrategy_js_1.throttlingRetryStrategy)()], {
            maxRetries: (_a = options.maxRetries) !== null && _a !== void 0 ? _a : constants_js_1.DEFAULT_RETRY_POLICY_COUNT,
        }).sendRequest,
    };
}
//# sourceMappingURL=throttlingRetryPolicy.js.map