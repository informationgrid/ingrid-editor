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
import { calculateChecksum, UploadComponent } from "./upload.component";

function file(content: string, boundaries: number[]) {
  const bytes = new TextEncoder().encode(content);

  const flowFile = {
    file: {
      slice: (startByte: number, endByte: number) => ({
        arrayBuffer: async () => bytes.slice(startByte, endByte).buffer,
      }),
    },
    chunks: [],
  } as unknown as flowjs.FlowFile;

  flowFile.chunks = boundaries.slice(0, -1).map((startByte, i) => ({
    fileObj: flowFile,
    startByte,
    endByte: boundaries[i + 1],
  })) as flowjs.FlowChunk[];

  return flowFile;
}

describe("Checksum Calculation (SHA-256)", () => {
  // https://emn178.github.io/online-tools/sha256.html for comparison

  it("should generate hashes that are exactly 64 characters long", async () => {
    const checksum = await calculateChecksum(file("abcdef", [0, 6]).chunks[0]);
    expect(checksum).toHaveLength(64);
    expect(checksum).toMatch(/^[a-f0-9]{64}$/); // check if hexadecimal
  });

  it("handles a single empty chunk", async () => {
    const emptyFlowFile = file("", [0, 0]);
    const checksum = await calculateChecksum(emptyFlowFile.chunks[0]);
    expect(checksum).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});

describe("Upload checksum preprocessing", () => {
  it("ignores a checksum that finishes after retry rebuilt the chunks", async () => {
    let finishReading: (bytes: ArrayBuffer) => void;
    const bytesRead = new Promise<ArrayBuffer>((resolve) => {
      finishReading = resolve;
    });

    const file = {
      file: {
        slice: () => ({ arrayBuffer: () => bytesRead }),
      },
      chunks: [],
    } as unknown as flowjs.FlowFile;

    const staleChunk = {
      fileObj: file,
      offset: 1,
      startByte: 0,
      endByte: 3,
      getParams: () => ({}),
      preprocessFinished: vi.fn(),
    } as unknown as flowjs.FlowChunk;
    file.chunks = [staleChunk];

    const component = Object.create(
      UploadComponent.prototype,
    ) as UploadComponent;
    (component as any).checksumCache = new WeakMap();
    const preprocessing = (component as any).prepareChecksums(staleChunk);

    // FlowFile.retry() replaces the chunks array while preprocessing can still
    // be awaiting the file read.
    file.chunks = [{} as flowjs.FlowChunk];
    finishReading!(new TextEncoder().encode("abc").buffer);
    await preprocessing;

    expect((staleChunk as any).preprocessFinished).not.toHaveBeenCalled();
    expect((component as any).checksumCache.get(file.chunks)).toBeUndefined();
  });
});
