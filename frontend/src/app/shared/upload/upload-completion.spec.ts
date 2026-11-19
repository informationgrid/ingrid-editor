/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 * https://joinup.ec.europa.eu/software/page/eupl
 */
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";
import { FlowInjectionToken } from "@flowjs/ngx-flow";
import { TranslocoService } from "@jsverse/transloco";
import { TransfersWithErrorInfo } from "./TransferWithErrors";
import { UploadComponent } from "./upload.component";
import { UploadError, UploadService } from "./upload.service";
import { UploadItemComponent } from "./upload-item/upload-item.component";

const merged = { success: true, files: [{ file: "example.txt" }] };

function chunk(responseText: string, status = 201, readyState = 4) {
  return {
    xhr: { responseText, status, readyState },
  } as unknown as flowjs.FlowChunk;
}

class TestFlow {
  static current: TestFlow;
  files: TestFile[] = [];
  opts: any;
  private listeners = new Map<string, Set<(...args: any[]) => void>>();

  constructor(options: any) {
    this.opts = options;
    TestFlow.current = this;
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  fire(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((callback) => callback(...args));
  }

  progress() {
    return 0;
  }

  upload() {}
}

class TestFile {
  uniqueIdentifier = "file-1";
  name = "example.txt";
  size = 42;
  paused = false;
  error = false;
  averageSpeed = 0;
  currentSpeed = 0;
  complete = false;
  chunks: flowjs.FlowChunk[] = [];

  constructor(public flowObj: TestFlow) {}

  progress() {
    return this.complete ? 1 : 0;
  }

  isComplete() {
    return this.complete;
  }

  timeRemaining() {
    return 0;
  }

  retry = vi.fn(() => {
    this.chunks = [chunk("")];
    this.complete = false;
    this.error = false;
    this.flowObj.fire("fileRetry", this);
  });
}

describe("Upload completion confirmation", () => {
  let fixture: ComponentFixture<UploadComponent>;
  let component: UploadComponent;
  let flow: TestFlow;
  let file: TestFile;
  let chosen: TransfersWithErrorInfo[];
  let complete: ReturnType<typeof vi.fn<(value: void) => void>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: FlowInjectionToken, useValue: TestFlow },
        { provide: UploadService, useValue: {} },
        {
          provide: TranslocoService,
          useValue: { translate: (key: string) => key },
        },
      ],
    })
      .overrideComponent(UploadComponent, {
        set: {
          template:
            '<ng-container #flow="flow" [flowConfig]="flowConfig()"></ng-container>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    fixture.componentRef.setInput("target", "/upload/doc");
    fixture.componentRef.setInput("requireMergeConfirmation", true);
    component = fixture.componentInstance;
    complete = vi.fn<(value: void) => void>();
    component.complete.subscribe(complete);
    component.chosenFiles.subscribe((value) => (chosen = value));
    fixture.detectChanges();
    flow = TestFlow.current;
    file = new TestFile(flow);
    flow.files.push(file);
    flow.fire("fileAdded", file);
  });

  function finish(
    chunks: flowjs.FlowChunk[],
    eventChunk = chunks[chunks.length - 1],
  ) {
    file.chunks = chunks;
    file.complete = true;
    flow.fire(
      "fileSuccess",
      file,
      eventChunk?.xhr?.responseText ?? "",
      eventChunk ?? {},
    );
  }

  it("accepts the merge response from an earlier chunk even when another chunk finishes last", () => {
    const first = chunk(JSON.stringify(merged));
    const last = chunk("");
    finish([first, last], last);

    expect(complete).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledWith(merged);
    expect(chosen[0].transfer.success).toBe(true);
    expect(chosen[0].error).toBeNull();
  });

  it("accepts the merge response when the last chunk carries it", () => {
    finish([chunk(""), chunk(JSON.stringify(merged))]);
    expect(complete).toHaveBeenCalledWith(merged);
    expect(chosen[0].transfer.success).toBe(true);
  });

  it.each<[string, flowjs.FlowChunk[]]>([
    ["missing xhr", [{} as flowjs.FlowChunk]],
    ["missing response", [chunk("")]],
    ["malformed JSON", [chunk("{oops")]],
    ["empty files", [chunk(JSON.stringify({ success: true, files: [] }))]],
    [
      "missing success",
      [chunk(JSON.stringify({ files: [{ file: "example.txt" }] }))],
    ],
    [
      "unsuccessful response",
      [chunk(JSON.stringify({ ...merged, success: false }))],
    ],
    [
      "missing file name",
      [chunk(JSON.stringify({ success: true, files: [{}] }))],
    ],
    [
      "empty file name",
      [chunk(JSON.stringify({ success: true, files: [{ file: "" }] }))],
    ],
    [
      "mixed invalid files",
      [chunk(JSON.stringify({ success: true, files: [{ file: "ok" }, {}] }))],
    ],
    ["non-2xx response", [chunk(JSON.stringify(merged), 500)]],
    ["unfinished xhr", [chunk(JSON.stringify(merged), 201, 3)]],
  ])("rejects %s as a retryable failure", (_description, chunks) => {
    finish(chunks);
    expect(complete).not.toHaveBeenCalled();
    expect(chosen[0].transfer.success).toBe(false);
    expect(chosen[0].error).toBeTruthy();
    expect(chosen[0].error.status).not.toBe(409);
  });

  it("does not expose success when the transfer updates before fileSuccess", () => {
    file.chunks = [chunk("")];
    file.complete = true;
    flow.fire("fileProgress", file, file.chunks[0]);
    expect(chosen[0].transfer.success).toBe(false);
    expect(chosen[0].error).toBeTruthy();
    expect(complete).not.toHaveBeenCalled();
  });

  it("does not reuse confirmation from the previous attempt after a full retry", async () => {
    finish([chunk(JSON.stringify(merged))]);
    expect(complete).toHaveBeenCalledOnce();
    const oldChunks = file.chunks;
    complete.mockClear();

    await component.retryUpload(chosen[0]);
    expect(file.retry).toHaveBeenCalledOnce();
    expect(file.chunks).not.toBe(oldChunks);
    finish(file.chunks);

    expect(complete).not.toHaveBeenCalled();
    expect(chosen[0].transfer.success).toBe(false);
    expect(chosen[0].error).toBeTruthy();
  });

  it("clears the unconfirmed error when a retry receives a valid merge response", async () => {
    finish([chunk("")]);
    expect(chosen[0].error).toBeTruthy();
    await component.retryUpload(chosen[0]);
    finish([chunk(JSON.stringify(merged))]);
    expect(complete).toHaveBeenCalledWith(merged);
    expect(chosen[0].transfer.success).toBe(true);
    expect(chosen[0].error).toBeNull();
  });

  it("preserves a 409 conflict and allows the existing file to be used", () => {
    file.chunks = [
      chunk(JSON.stringify({ message: "The file already exists." }), 409),
    ];
    file.complete = true;
    file.error = true;
    flow.fire("fileError", file, "", file.chunks[0]);
    expect(chosen[0].error.status).toBe(409);
    expect(chosen[0].transfer.success).toBe(false);
    expect(complete).not.toHaveBeenCalled();

    component.updateFileToUseExisting(chosen[0].transfer);
    expect(chosen[0].transfer.success).toBe(true);
    expect(chosen[0].error).toBeNull();
    expect(complete).toHaveBeenCalledOnce();
  });

  it("keeps custom-target success behavior without merge confirmation", () => {
    fixture.componentRef.setInput("requireMergeConfirmation", false);
    fixture.detectChanges();
    finish([chunk('{"custom":"result"}')]);
    expect(complete).toHaveBeenCalledWith({ custom: "result" });
    expect(chosen[0].transfer.success).toBe(true);
    expect(chosen[0].error).toBeNull();
  });
});

describe("Upload item completion display", () => {
  it("shows a retryable error instead of a green check for an unconfirmed upload", () => {
    TestBed.configureTestingModule({
      imports: [UploadItemComponent],
      providers: [provideHttpClient()],
    });
    TestBed.inject(MatIconRegistry).addSvgIconLiteral(
      "baseline-check-24px",
      TestBed.inject(DomSanitizer).bypassSecurityTrustHtml("<svg></svg>"),
    );
    const fixture = TestBed.createComponent(UploadItemComponent);
    const transfer = {
      name: "example.txt",
      size: 42,
      progress: 1,
      success: false,
    } as any;
    fixture.componentRef.setInput("showOnlyProgress", true);
    fixture.componentRef.setInput(
      "file",
      new TransfersWithErrorInfo(
        new UploadError(0, "Unconfirmed", null),
        transfer,
      ),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-icon.green")).toBeNull();
    expect(fixture.nativeElement.textContent).toContain("Unconfirmed");
    expect(fixture.nativeElement.textContent).toContain("Erneut versuchen");

    fixture.componentRef.setInput(
      "file",
      new TransfersWithErrorInfo(null, transfer),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-icon.green")).toBeNull();
    fixture.componentRef.setInput(
      "file",
      new TransfersWithErrorInfo(null, { ...transfer, success: true }),
    );
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("mat-icon.green"),
    ).not.toBeNull();
  });
});
