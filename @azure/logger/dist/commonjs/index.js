"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureLogger = void 0;
exports.setLogLevel = setLogLevel;
exports.getLogLevel = getLogLevel;
exports.createClientLogger = createClientLogger;
const tslib_1 = require("tslib");
const debug_js_1 = tslib_1.__importDefault(require("./debug.js"));
const registeredLoggers = new Set();
const logLevelFromEnv = (typeof process !== "undefined" && process.env && process.env.AZURE_LOG_LEVEL) || undefined;
let azureLogLevel;
/**
 * The AzureLogger provides a mechanism for overriding where logs are output to.
 * By default, logs are sent to stderr.
 * Override the `log` method to redirect logs to another location.
 */
exports.AzureLogger = (0, debug_js_1.default)("azure");
exports.AzureLogger.log = (...args) => {
    debug_js_1.default.log(...args);
};
const AZURE_LOG_LEVELS = ["verbose", "info", "warning", "error"];
if (logLevelFromEnv) {
    // avoid calling setLogLevel because we don't want a mis-set environment variable to crash
    if (isAzureLogLevel(logLevelFromEnv)) {
        setLogLevel(logLevelFromEnv);
    }
    else {
        console.error(`AZURE_LOG_LEVEL set to unknown log level '${logLevelFromEnv}'; logging is not enabled. Acceptable values: ${AZURE_LOG_LEVELS.join(", ")}.`);
    }
}
/**
 * Immediately enables logging at the specified log level. If no level is specified, logging is disabled.
 * @param level - The log level to enable for logging.
 * Options from most verbose to least verbose are:
 * - verbose
 * - info
 * - warning
 * - error
 */
function setLogLevel(level) {
    if (level && !isAzureLogLevel(level)) {
        throw new Error(`Unknown log level '${level}'. Acceptable values: ${AZURE_LOG_LEVELS.join(",")}`);
    }
    azureLogLevel = level;
    const enabledNamespaces = [];
    for (const logger of registeredLoggers) {
        if (shouldEnable(logger)) {
            enabledNamespaces.push(logger.namespace);
        }
    }
    debug_js_1.default.enable(enabledNamespaces.join(","));
}
/**
 * Retrieves the currently specified log level.
 */
function getLogLevel() {
    return azureLogLevel;
}
const levelMap = {
    verbose: 400,
    info: 300,
    warning: 200,
    error: 100,
};
/**
 * Creates a logger for use by the Azure SDKs that inherits from `AzureLogger`.
 * @param namespace - The name of the SDK package.
 * @hidden
 */
function createClientLogger(namespace) {
    const clientRootLogger = exports.AzureLogger.extend(namespace);
    patchLogMethod(exports.AzureLogger, clientRootLogger);
    return {
        error: createLogger(clientRootLogger, "error"),
        warning: createLogger(clientRootLogger, "warning"),
        info: createLogger(clientRootLogger, "info"),
        verbose: createLogger(clientRootLogger, "verbose"),
    };
}
function patchLogMethod(parent, child) {
    child.log = (...args) => {
        parent.log(...args);
    };
}
function createLogger(parent, level) {
    const logger = Object.assign(parent.extend(level), {
        level,
    });
    patchLogMethod(parent, logger);
    if (shouldEnable(logger)) {
        const enabledNamespaces = debug_js_1.default.disable();
        debug_js_1.default.enable(enabledNamespaces + "," + logger.namespace);
    }
    registeredLoggers.add(logger);
    return logger;
}
function shouldEnable(logger) {
    return Boolean(azureLogLevel && levelMap[logger.level] <= levelMap[azureLogLevel]);
}
function isAzureLogLevel(logLevel) {
    return AZURE_LOG_LEVELS.includes(logLevel);
}
//# sourceMappingURL=index.js.map