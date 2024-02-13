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
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import {
  SelectGeoDatasetDialog,
  SelectServiceResponse,
} from "./select-service-dialog/select-geo-dataset-dialog.component";
import {
  SelectCswRecordDialog,
  SelectCswRecordResponse,
} from "./select-csw-record-dialog/select-csw-record-dialog";
import { Router } from "@angular/router";
import { ConfigService } from "../../../services/config/config.service";
import { DocumentService } from "../../../services/document/document.service";
import { distinctUntilChanged, map, startWith } from "rxjs/operators";
import { DocumentState, IgeDocument } from "../../../models/ige-document";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TreeQuery } from "../../../store/tree/tree.query";
import { firstValueFrom } from "rxjs";

interface Reference {
  isExternalRef: boolean;
}

export interface DocumentReference extends Reference {
  title: string;
  uuid: string;
  state: DocumentState;
  type: string;
  icon: "Geodatensatz";
}

interface UrlReference extends Reference {
  title: string;
  url: string;
}

export const docReferenceTemplate: Partial<DocumentReference> = {
  isExternalRef: false,
};

@UntilDestroy()
@Component({
  selector: "ige-document-reference-type",
  templateUrl: "./document-reference-type.component.html",
  styleUrls: ["./document-reference-type.component.scss"],
})
export class DocumentReferenceTypeComponent
  extends FieldArrayType
  implements OnInit
{
  myModel: (DocumentReference | UrlReference)[];

  refreshing = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private docService: DocumentService,
    private tree: TreeQuery,
  ) {
    super();
  }

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(<any[]>this.formControl.value),
        distinctUntilChanged((a, b) => {
          if (a.length !== b.length) return false;
          return (
            JSON.stringify(a.map((item: any) => item.uuid)) ===
            JSON.stringify(b.map((item: any) => item.uuid))
          );
        }),
      )
      .subscribe((_) => this.buildModel());
  }

  showInternalRefDialog() {
    this.dialog
      .open(SelectGeoDatasetDialog, { minWidth: 400, data: this.getRefUuids() })
      .afterClosed()
      .subscribe((item: SelectServiceResponse) => {
        if (item) {
          this.add(null, {
            uuid: item.uuid,
            isExternalRef: false,
          });
          this.props.change?.(this.field);
        }
      });
  }

  showExternalRefDialog() {
    this.dialog
      .open(SelectCswRecordDialog, {
        data: {
          asAtomDownloadService:
            this.options.formState.mainModel.service.isAtomDownload,
        },
        minWidth: 400,
      })
      .afterClosed()
      .subscribe((item: SelectCswRecordResponse) => {
        if (item) {
          this.add(null, {
            ...item,
            isExternalRef: true,
          });
          this.props.change?.(this.field);
        }
      });
  }

  async openReference(item: DocumentReference | UrlReference) {
    if (this.formControl.disabled) return;

    if (item.isExternalRef) {
      window.open((<UrlReference>item).url, "_blank");
    } else {
      return this.router.navigate([
        `${ConfigService.catalogId}/form`,
        { id: (<DocumentReference>item).uuid },
      ]);
    }
  }

  removeItem(index: number, event: MouseEvent) {
    event.stopImmediatePropagation();
    this.remove(index);
    this.props.change?.(this.field, event);
  }

  private async buildModel() {
    this.refreshing = true;
    this.myModel = await Promise.all(
      this.formControl.value.map(async (item: any) => {
        return item.isExternalRef
          ? this.mapExternalRef(item)
          : this.mapInternalRef(item);
      }),
    );
    this.refreshing = false;
    this.cdr.detectChanges();
  }

  private mapExternalRef(item: any): UrlReference {
    return {
      title: item.title ?? item.url,
      url: item.url,
      isExternalRef: true,
    };
  }

  private async mapInternalRef(item: any): Promise<DocumentReference> {
    const nodeEntity = this.tree.getByUuid(item.uuid);
    if (nodeEntity) {
      return this.mapToDocumentReference(nodeEntity);
    }

    return await firstValueFrom(
      this.docService.load(item.uuid, false, false, true).pipe(
        map((doc) => {
          return this.mapToDocumentReference(doc);
        }),
      ),
    );
  }

  private mapToDocumentReference(doc: IgeDocument): DocumentReference {
    return {
      uuid: doc?._uuid,
      isExternalRef: false,
      title: doc?.title,
      state: doc?._state,
      type: doc?._type,
      icon: "Geodatensatz",
    };
  }

  private getRefUuids(): string[] {
    return this.formControl.value
      .filter((item: any) => item.uuid)
      .map((item: any) => item.uuid);
  }
}
