/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { calculateChecksums } from "./upload.component";

/**
 * Mock file content and chunk boundaries
 * @param content
 * @param boundaries
 */
function file(content: string, boundaries: number[]) {
  const bytes = new TextEncoder().encode(content);
  return {
    file: {
      slice: (startByte: number, endByte: number) => ({
        arrayBuffer: async () => bytes.slice(startByte, endByte).buffer,
      }),
    },
    chunks: boundaries
      .slice(0, -1)
      .map((startByte, i) => ({ startByte, endByte: boundaries[i + 1] })),
  } as unknown as flowjs.FlowFile;
}

describe("Checksum Calculation (SHA-256)", () => {
  // https://emn178.github.io/online-tools/sha256.html for comparison

  it("should generate hashes that are exactly 64 characters long", async () => {
    const result = await calculateChecksums(file("abcdef", [0, 3, 6]));

    result.checksums.forEach((hash) => {
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // check if hexadecimal
    });

    expect(result.combinedChecksum).toHaveLength(64);
    expect(result.combinedChecksum).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should calculate a combined checksum from a single chunk checksum", async () => {
    const result = await calculateChecksums(file("abcdef", [0, 6]));

    expect(result.checksums).toHaveLength(1);
    expect(result.checksums[0]).toBe(
      "bef57ec7f53a6d40beb640a780a639c83bc29ac8a9816f1fc6c5c6dcd93c4721",
    );

    // The combined checksum hashes the concatenated chunk checksums,
    // when there is only one checksum, it can not be equal to the combined checksum
    expect(result.checksums[0]).not.toBe(result.combinedChecksum);
    expect(result.combinedChecksum).toBe(
      "1c3951fc51112a02ae7a82720fbed831a07bcde22bdaffefdea17392b6687620",
    );
  });

  it("hashes chunks and combines their hexadecimal hashes in file order", async () => {
    const result = await calculateChecksums(file("abcdef", [0, 3, 6]));
    expect(result.checksums).toHaveLength(2);
    expect(result.checksums[0]).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(result.combinedChecksum).toBe(
      "c4e66df524678be2ce0ac784f9cd63c1f9f888f802808b4881114855783812a5",
    );

    const reversed = await calculateChecksums(file("defabc", [0, 3, 6]));
    expect(reversed.checksums).toHaveLength(2);
    expect(result.combinedChecksum).not.toBe(reversed.combinedChecksum);

    const random = await calculateChecksums(file("fdacbe", [0, 3, 6]));
    expect(random.checksums).toHaveLength(2);
    expect(result.combinedChecksum).not.toBe(random.combinedChecksum);

    const different = await calculateChecksums(file("abcdeg", [0, 3, 6]));
    expect(different.checksums).toHaveLength(2);
    expect(result.combinedChecksum).not.toBe(different.combinedChecksum);
  });

  it("handles a single empty chunk", async () => {
    const result = await calculateChecksums(file("", [0, 0]));
    expect(result.checksums[0]).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});
