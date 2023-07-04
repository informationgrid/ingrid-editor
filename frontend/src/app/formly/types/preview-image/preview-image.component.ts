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
  distinctUntilChanged,
  filter,
  startWith,
  tap,
} from "rxjs/operators";
import { LinkDialogComponent } from "../table/link-dialog/link-dialog.component";
import {
  FormDialogComponent,
  FormDialogData,
} from "../table/form-dialog/form-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { AsyncPipe, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { ConfigService } from "../../../services/config/config.service";
import { UploadService } from "../../../shared/upload/upload.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { IgeError } from "../../../models/ige-error";

@UntilDestroy()
@Component({
  selector: "ige-repeat",
  templateUrl: "./preview-image.component.html",
  styleUrls: ["./preview-image.component.scss"],
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    NgForOf,
    NgOptimizedImage,
    MatIconModule,
    AsyncPipe,
    NgIf,
    MatTooltipModule,
  ],
})
export class PreviewImageComponent extends FieldArrayType implements OnInit {
  private dialog = inject(MatDialog);
  private uploadService = inject(UploadService);
  private cdr = inject(ChangeDetectorRef);

  private linkFields: FormlyFieldConfig[] = [
    {
      key: "fileName",
      type: "upload",
      props: {
        label: "URL",
        appearance: "outline",
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

  imageLinks: any = {};

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(this.formControl.value),
        distinctUntilChanged((a: any[], b: any[]) => {
          const aLinks = a?.map((item) => item.fileName?.uri).join("");
          const bLinks = b?.map((item) => item.fileName?.uri).join("");
          return aLinks === bLinks;
        })
      )
      .subscribe((value) => this.createImageLinkUris(value));
  }

  showUploadFilesDialog() {
    this.dialog
      .open(UploadFilesDialogComponent, {
        minWidth: 700,
        restoreFocus: true,
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
        restoreFocus: true,
        data: {
          fields: this.linkFields,
          model: {},
          newEntry: true,
        } as FormDialogData,
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
          this.imageLinks = {};
          this.remove(index);
          this.add(index, result);
        }
      });
  }

  private addUpload(files: LinkInfo[]) {
    files.forEach((file) =>
      this.add(null, {
        fileName: { uri: file.uri, asLink: false, value: file.file },
      })
    );
  }

  private createImageLinkUris(value: any[]) {
    value?.map((item, index) => {
      const uri = item.fileName?.uri;
      if (!uri || this.imageLinks[uri] !== undefined) return;

      if (item.fileName?.asLink) {
        this.imageLinks[uri] = uri;
        return;
      }

      const docUuid = this.formControl.root.value._uuid;
      return this.uploadService
        .getFile(docUuid, uri)
        .pipe(
          tap((hash) => this.addUploadUri(uri, hash)),
          catchError((error) => {
            console.log(error);
            const igeError = new IgeError(
              "Das Bild konnte auf dem Server nicht mehr gefunden werden"
            );
            igeError.detail = error.message;
            throw igeError;
          })
        )
        .subscribe(() => this.cdr.detectChanges());
    });
    this.cdr.detectChanges();
  }

  private addUploadUri(uri: string, hash: String) {
    return (this.imageLinks[
      uri
    ] = `${ConfigService.backendApiUrl}upload/download/${hash}`);
  }
}
