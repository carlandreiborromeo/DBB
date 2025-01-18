/**
 * Accepted binary data types for concat
 *
 * @internal
 */
type ConcatSource = ReadableStream<Uint8Array> | Blob | Uint8Array;
/**
 * Utility function that concatenates a set of binary inputs into one combined output.
 *
 * @param sources - array of sources for the concatenation
 * @returns - in Node, a (() =\> NodeJS.ReadableStream) which, when read, produces a concatenation of all the inputs.
 *           In browser, returns a `Blob` representing all the concatenated inputs.
 *
 * @internal
 */
export declare function concat(sources: (ConcatSource | (() => ConcatSource))[]): Promise<(() => NodeJS.ReadableStream) | Blob>;
export {};
//# sourceMappingURL=concat.common.d.ts.map