// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getRawContent } from "./file.js";
import { isNodeReadableStream, isWebReadableStream } from "./typeGuards.js";
/**
 * Drain the content of the given ReadableStream into a Blob.
 * The blob's content may end up in memory or on disk dependent on size.
 */
function drain(stream) {
    return new Response(stream).blob();
}
async function toBlobPart(source) {
    if (source instanceof Blob || source instanceof Uint8Array) {
        return source;
    }
    if (isWebReadableStream(source)) {
        return drain(source);
    }
    // If it's not a true Blob, and it's not a Uint8Array, we can assume the source
    // is a fake File created by createFileFromStream and we can get the original stream
    // using getRawContent.
    const rawContent = getRawContent(source);
    // Shouldn't happen but guard for it anyway
    if (isNodeReadableStream(rawContent)) {
        throw new Error("Encountered unexpected type. In the browser, `concat` supports Web ReadableStream, Blob, Uint8Array, and files created using `createFile` only.");
    }
    return toBlobPart(rawContent);
}
/**
 * Utility function that concatenates a set of binary inputs into one combined output.
 *
 * @param sources - array of sources for the concatenation
 * @returns - in Node, a (() =\> NodeJS.ReadableStream) which, when read, produces a concatenation of all the inputs.
 *           In browser, returns a `Blob` representing all the concatenated inputs.
 *
 * @internal
 */
export async function concat(sources) {
    const parts = [];
    for (const source of sources) {
        parts.push(await toBlobPart(typeof source === "function" ? source() : source));
    }
    return new Blob(parts);
}
//# sourceMappingURL=concat.common.js.map