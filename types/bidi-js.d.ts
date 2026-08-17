/**
 * Minimal typings for bidi-js, which ships as untyped JavaScript. Only the
 * members lib/bidi.ts uses are declared — extend this if more are needed.
 */
declare module "bidi-js" {
  export type EmbeddingLevels = {
    levels: Uint8Array;
    paragraphs: Array<{ start: number; end: number; level: number }>;
  };

  export type Bidi = {
    getEmbeddingLevels(text: string, baseDirection?: "ltr" | "rtl" | "auto"): EmbeddingLevels;
    getReorderSegments(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number
    ): Array<[number, number]>;
    getReorderedIndices(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number
    ): number[];
    getReorderedString(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number
    ): string;
    getMirroredCharacter(char: string): string | null;
    getMirroredCharactersMap(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number
    ): Map<number, string>;
  };

  export default function bidiFactory(): Bidi;
}
