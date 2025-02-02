"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodeReadableStream = isNodeReadableStream;
exports.isWebReadableStream = isWebReadableStream;
exports.isReadableStream = isReadableStream;
exports.isBlob = isBlob;
function isNodeReadableStream(x) {
    return Boolean(x && typeof x["pipe"] === "function");
}
function isWebReadableStream(x) {
    return Boolean(x &&
        typeof x.getReader === "function" &&
        typeof x.tee === "function");
}
function isReadableStream(x) {
    return isNodeReadableStream(x) || isWebReadableStream(x);
}
function isBlob(x) {
    return typeof x.stream === "function";
}
//# sourceMappingURL=typeGuards.js.map