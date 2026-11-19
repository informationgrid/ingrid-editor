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
import { Component, input, output } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { Transfer } from "@flowjs/ngx-flow";
import { of } from "rxjs";
import { FormStateService } from "../../../../+form/form-state.service";
import { ConfigService } from "../../../../services/config/config.service";
import { SessionTimeoutInterceptor } from "../../../../services/session-timeout.interceptor";
import { DialogTemplateComponent } from "../../../../shared/dialog-template/dialog-template.component";
import { TransfersWithErrorInfo } from "../../../../shared/upload/TransferWithErrors";
import { UploadComponent } from "../../../../shared/upload/upload.component";
import {
  UploadError,
  UploadService,
} from "../../../../shared/upload/upload.service";
import { UploadFilesDialogComponent } from "./upload-files-dialog.component";

@Component({ selector: "ige-file-upload", template: "" })
class UploadStub {
  target = input<string>();
  requireMergeConfirmation = input(false);
  additionalParameters = input<any>();
  infoText = input<string>();
  allowedUploadTypes = input<string[]>();
  multiple = input<boolean>();
  enableFileUploadOverride = input<boolean>();
  enableFileUploadReuse = input<boolean>();
  enableFileUploadRename = input<boolean>();
  chosenFiles = output<TransfersWithErrorInfo[]>();
  removeFile = output<string>();
  complete = output<void>();
}

@Component({
  selector: "ige-dialog-template",
  template:
    '<ng-content></ng-content><button [disabled]="disabled()" (click)="submit.emit()">Submit</button>',
})
class DialogTemplateStub {
  label = input<string>();
  contentColor = input<string>();
  disabled = input(false);
  submit = output<void>();
  cancel = output<void>();
}

function uploaded(name: string, success: boolean) {
  const transfer = { name, id: name, size: 42, success } as Transfer;
  return new TransfersWithErrorInfo(
    success ? null : new UploadError(0, "Unconfirmed upload", null),
    transfer,
  );
}

describe("Upload files dialog completion", () => {
  const close = vi.fn();
  const extract = vi.fn();

  beforeEach(async () => {
    close.mockReset();
    extract.mockReset();
    await TestBed.configureTestingModule({
      imports: [UploadFilesDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close } },
        { provide: MatDialog, useValue: {} },
        {
          provide: FormStateService,
          useValue: { metadata: () => ({ uuid: "doc-1" }) },
        },
        {
          provide: ConfigService,
          useValue: { getConfiguration: () => ({ backendUrl: "/api/" }) },
        },
        {
          provide: UploadService,
          useValue: { extractUploadedFilesOnServer: extract },
        },
        {
          provide: SessionTimeoutInterceptor,
          useValue: { refreshSession: vi.fn() },
        },
      ],
    })
      .overrideComponent(UploadFilesDialogComponent, {
        remove: { imports: [UploadComponent, DialogTemplateComponent] },
        add: { imports: [UploadStub, DialogTemplateStub] },
      })
      .compileComponents();
  });

  function create(data: any = {}) {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    const fixture = TestBed.createComponent(UploadFilesDialogComponent);
    fixture.detectChanges();
    const upload = fixture.debugElement.query(By.directive(UploadStub))
      .componentInstance as UploadStub;
    const dialog = fixture.debugElement.query(By.directive(DialogTemplateStub))
      .componentInstance as DialogTemplateStub;
    return { fixture, upload, dialog };
  }

  it("requires merge confirmation for the default document target", () => {
    const { upload } = create();
    expect(upload.target()).toBe("/api/upload/doc-1");
    expect(upload.requireMergeConfirmation()).toBe(true);
  });

  it("does not require merge confirmation for an explicit custom target", () => {
    const { upload } = create({ targetUrl: "/custom" });
    expect(upload.target()).toBe("/custom");
    expect(upload.requireMergeConfirmation()).toBe(false);
  });

  it("does not auto-submit or enable confirmation for an unconfirmed upload", () => {
    const { fixture, upload, dialog } = create({ autoSubmit: true });
    upload.chosenFiles.emit([uploaded("lost.txt", false)]);
    fixture.detectChanges();
    expect(dialog.disabled()).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it("auto-submits only successful files when completion is emitted", () => {
    const { upload } = create({ autoSubmit: true });
    upload.chosenFiles.emit([
      uploaded("lost.txt", false),
      uploaded("ok.txt", true),
    ]);
    upload.complete.emit();
    expect(close).toHaveBeenCalledWith([
      { file: "ok.txt", uri: "ok.txt", sizeInBytes: 42 },
    ]);
  });

  it("extracts only successful uploads and returns extracted files", () => {
    extract.mockReturnValue(
      of({ files: [{ file: "inner.txt", uri: "inner%20file.txt", size: 5 }] }),
    );
    const { fixture, upload } = create();
    upload.chosenFiles.emit([
      uploaded("lost.zip", false),
      uploaded("ok.zip", true),
    ]);
    fixture.componentInstance.extractZipFiles.set(true);
    upload.complete.emit();
    fixture.componentInstance.submit();
    expect(extract).toHaveBeenCalledOnce();
    expect(extract).toHaveBeenCalledWith("doc-1", "ok.zip", undefined);
    expect(close).toHaveBeenCalledWith([
      { file: "inner.txt", uri: "inner file.txt", sizeInBytes: 5 },
    ]);
  });
});
