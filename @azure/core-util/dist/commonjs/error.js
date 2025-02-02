"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = isError;
exports.getErrorMessage = getErrorMessage;
const object_js_1 = require("./object.js");
/**
 * Typeguard for an error object shape (has name and message)
 * @param e - Something caught by a catch clause.
 */
function isError(e) {
    if ((0, object_js_1.isObject)(e)) {
        const hasName = typeof e.name === "string";
        const hasMessage = typeof e.message === "string";
        return hasName && hasMessage;
    }
    return false;
}
/**
 * Given what is thought to be an error object, return the message if possible.
 * If the message is missing, returns a stringified version of the input.
 * @param e - Something thrown from a try block
 * @returns The error message or a string of the input
 */
function getErrorMessage(e) {
    if (isError(e)) {
        return e.message;
    }
    else {
        let stringified;
        try {
            if (typeof e === "object" && e) {
                stringified = JSON.stringify(e);
            }
            else {
                stringified = String(e);
            }
        }
        catch (err) {
            stringified = "[unable to stringify input]";
        }
        return `Unknown error ${stringified}`;
    }
}
//# sourceMappingURL=error.js.map