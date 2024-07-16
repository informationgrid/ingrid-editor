/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatButtonModule } from "@angular/material/button";
import {
  LinkInfo,
  UploadFilesDialogComponent,
} from "../table/upload-files-dialog/upload-files-dialog.component";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  startWith,
  tap,
} from "rxjs/operators";
import { LinkDialogComponent } from "../table/link-dialog/link-dialog.component";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";

import {
  FormDialogComponent,
  FormDialogData,
} from "../table/form-dialog/form-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { AsyncPipe, NgOptimizedImage } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { ConfigService } from "../../../services/config/config.service";
import { UploadService } from "../../../shared/upload/upload.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormMessageService } from "../../../services/form-message.service";
import { of } from "rxjs";
import { REGEX_URL } from "../../input.validators";
import { TranslocoService } from "@ngneat/transloco";
import { FormStateService } from "../../../+form/form-state.service";

@UntilDestroy()
@Component({
  selector: "ige-repeat",
  templateUrl: "./preview-image.component.html",
  styleUrls: ["./preview-image.component.scss"],
  standalone: true,
  imports: [
    MatButtonModule,
    CdkDropList,
    CdkDrag,
    CdkDragPreview,
    MatCardModule,
    NgOptimizedImage,
    MatIconModule,
    AsyncPipe,
    MatTooltipModule,
  ],
})
export class PreviewImageComponent extends FieldArrayType implements OnInit {
  private dialog = inject(MatDialog);
  private uploadService = inject(UploadService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(FormMessageService);
  private translocoService = inject(TranslocoService);
  private formStateService = inject(FormStateService);

  private linkFields: FormlyFieldConfig[] = [
    {
      key: "fileName",
      type: "upload",
      wrappers: ["form-field"],
      props: {
        label: "URL",
        appearance: "outline",
        required: true,
        onClick: (docUuid, uri, $event) => {
          // this.uploadService.downloadFile(docUuid, uri, $event);
        },
        formatter: (link: any) => {
          if (link.asLink) {
            return `<a  href="${link.uri}" target="_blank" class="no-text-transform icon-in-table">
                         <img  width="20"  height="20" src="assets/icons/external_link.svg"  alt="link"> ${link.uri}  </a> `;
          } else {
            return `<span class="clickable-text icon-in-table">  <img  width="20"  height="20" src="assets/icons/download.svg"  alt="link"> ${link.uri}</span>`;
          }
        },
      },
      validators: {
        url: {
          expression: (field) => {
            const regExp = new RegExp(REGEX_URL);
            return field.value?.asLink
              ? regExp.test(field.value?.uri?.trim())
              : true;
          },
          message: () =>
            this.translocoService.translate("form.validationMessages.url"),
        },
      },
      expressions: {
        "props.label": (field) =>
          field.formControl.value?.asLink ? "URL (Link)" : "Dateiname (Upload)",
      },
    },
    {
      key: "fileDescription",
      type: "input",
      props: {
        label: "Beschreibung",
        appearance: "outline",
      },
    },
  ];

  imageLinks: any = [];

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(this.formControl.value),
        debounceTime(100),
        distinctUntilChanged((a: any[], b: any[]) => {
          const aLinks = a?.map((item) => item.fileName?.uri).join("");
          const bLinks = b?.map((item) => item.fileName?.uri).join("");
          return aLinks === bLinks;
        }),
        tap(() => {
          // we need to reset the imageLinks so when we open another document
          // we do not start to access the previous images
          this.imageLinks = [];
        }),
      )
      .subscribe((value) => this.createImageLinkUris(value));
  }

  showUploadFilesDialog() {
    this.dialog
      .open(UploadFilesDialogComponent, {
        minWidth: 700,
        data: {
          allowedUploadTypes: [
            "gif",
            "jpg",
            "jpeg",
            "jfif",
            "pjpeg",
            "pjp",
            "png",
            "svg+xml",
            "webp",
            "dib",
            "bmp",
          ],
          // currentItems: this.dataSource.data,
          // uploadFieldKey: this.getUploadFieldKey(),
          // hasExtractZipOption: true,
        },
      })
      .afterClosed()
      .pipe(filter((result) => result !== undefined))
      .subscribe((files: LinkInfo[]) => this.addUpload(files));
  }

  showAddLinkDialog() {
    this.dialog
      .open(LinkDialogComponent, {
        maxWidth: 600,
        hasBackdrop: true,
        data: {
          fields: this.linkFields,
          model: {},
          newEntry: true,
        } as FormDialogData,
        delayFocusTrap: true,
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => this.addLink(result));
  }

  private addLink(result: any) {
    this.add(null, result);
  }

  edit(index: number) {
    this.dialog
      .open(FormDialogComponent, {
        data: {
          fields: this.linkFields,
          model: this.model[index],
        } as FormDialogData,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          // this.imageLinks = [];
          this.remove(index);
          this.add(index, result);
        }
      });
  }

  private addUpload(files: LinkInfo[]) {
    files.forEach((file) =>
      this.add(null, {
        fileName: { uri: file.uri, asLink: false, value: file.file },
      }),
    );
  }

  /**
   * The uploaded images are protected and cannot simply be accessed within an
   * img-src-link. Therefore, we request temporary access to the resource, which
   * is unprotected for a short time.
   */
  private createImageLinkUris(value: any[]) {
    value?.forEach((item) => {
      const uri = item.fileName?.uri;

      if (item.fileName?.asLink) {
        this.imageLinks[uri] = uri;
        return;
      }

      this.updateTemporaryImageUrl(uri);
    });
    this.cdr.detectChanges();
  }

  private updateTemporaryImageUrl(uri: string) {
    const docUuid = this.formStateService.metadata().uuid;
    return this.uploadService
      .getFile(docUuid, uri)
      .pipe(
        tap((hash) => this.addUploadUri(uri, hash)),
        catchError((error) => {
          console.log(error);
          this.messageService.sendError(
            "Die Vorschaugrafik konnte auf dem Server nicht mehr gefunden werden",
          );
          return of(error);
        }),
      )
      .subscribe(() => this.cdr.detectChanges());
  }

  private addUploadUri(uri: string, hash: String) {
    return (this.imageLinks[uri] =
      `${ConfigService.backendApiUrl}upload/download/${hash}`);
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    moveItemInArray(
      this.field.fieldGroup,
      event.previousIndex,
      event.currentIndex,
    );

    moveItemInArray(this.model, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.field.fieldGroup.length; i++) {
      this.field.fieldGroup[i].key = `${i}`;
    }
    this.options.build(this.field);
  }

  /**
   * Since the uploaded images are protected, we are going to use the already
   * downloaded image data to be used during dragging
   */
  prepareForDrag(filename: any, index: number) {
    if (filename.asLink) return;
    this.imageLinks[filename.uri] = this.getBase64StringFromImage(index);
    this.cdr.detectChanges();
  }

  private getBase64StringFromImage(index: number) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const img: HTMLImageElement = document.querySelector(
      "img.preview-image-" + index,
    );
    canvas.height = img.height;
    canvas.width = img.width;
    context.drawImage(img, 0, 0, img.width, img.height);
    return canvas.toDataURL();
  }
}
