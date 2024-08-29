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
import { FieldArrayType, FormlyModule } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import {
  SelectGeoDatasetData,
  SelectGeoDatasetDialog,
  SelectServiceResponse,
} from "./select-service-dialog/select-geo-dataset-dialog.component";
import {
  SelectCswRecordData,
  SelectCswRecordDialog,
  SelectCswRecordResponse,
} from "./select-csw-record-dialog/select-csw-record-dialog";
import { Router } from "@angular/router";
import { ConfigService } from "../../../services/config/config.service";
import { DocumentService } from "../../../services/document/document.service";
import { debounceTime, map, startWith } from "rxjs/operators";
import { DocumentState, IgeDocument } from "../../../models/ige-document";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TreeQuery } from "../../../store/tree/tree.query";
import { firstValueFrom } from "rxjs";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { MatIcon } from "@angular/material/icon";
import { DocumentIconComponent } from "../../../shared/document-icon/document-icon.component";
import { MatIconButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";

interface Reference {
  layerNames: string[];
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
    standalone: true,
    imports: [
        FormErrorComponent,
        FormlyModule,
        MatIcon,
        DocumentIconComponent,
        MatIconButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatProgressSpinner,
        AddButtonComponent,
    ],
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
        debounceTime(10),
      )
      .subscribe((_) => this.buildModel());
  }

  showInternalRefDialog(index?: number) {
    const data: SelectGeoDatasetData = {
      currentRefs: this.getRefUuids().filter((item, idx) => idx !== index),
      activeRef: index >= 0 ? this.getRefUuids()[index] : null,
      layerNames: index >= 0 ? this.formControl.value[index].layerNames : [],
      showLayernames: this.props.showLayernames,
    };
    this.dialog
      .open(SelectGeoDatasetDialog, {
        minWidth: 400,
        data: data,
      })
      .afterClosed()
      .subscribe((item: SelectServiceResponse) => {
        if (!item) return;
        this.updateValue(
          {
            uuid: item.uuid,
            layerNames: item.layerNames,
            isExternalRef: false,
          },
          index,
        );
      });
  }

  showExternalRefDialog(index?: number) {
    const data: SelectCswRecordData = {
      asAtomDownloadService:
        this.options.formState.mainModel.service.isAtomDownload,
      layerNames: index >= 0 ? this.formControl.value[index].layerNames : [],
      url: index >= 0 ? this.formControl.value[index].url : null,
      showLayernames: this.props.showLayernames,
    };
    this.dialog
      .open(SelectCswRecordDialog, {
        data: data,
        minWidth: 400,
      })
      .afterClosed()
      .subscribe((item: SelectCswRecordResponse) => {
        if (!item) return;
        this.updateValue(
          {
            ...item,
            isExternalRef: true,
          },
          index,
        );
      });
  }

  private updateValue(item: any, index?: number) {
    const isNotNew = index >= 0;
    if (isNotNew) {
      this.remove(index);
    }
    setTimeout(() => this.add(index, item));
    this.props.change?.(this.field);
    console.log("update value", item);
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
      layerNames: item.layerNames,
      isExternalRef: true,
    };
  }

  private async mapInternalRef(
    item: DocumentReference,
  ): Promise<DocumentReference> {
    const nodeEntity = this.tree.getByUuid(item.uuid);
    if (nodeEntity) {
      return this.mapToDocumentReference(nodeEntity, item.layerNames);
    }

    return await firstValueFrom(
      this.docService.load(item.uuid, false, false, true).pipe(
        map((doc) => {
          return this.mapToDocumentReference(
            doc.documentWithMetadata,
            item.layerNames,
          );
        }),
      ),
    );
  }

  private mapToDocumentReference(
    doc: IgeDocument,
    layerNames: string[],
  ): DocumentReference {
    return {
      uuid: doc?._uuid,
      isExternalRef: false,
      title: doc?.title,
      state: doc?._state,
      type: doc?._type,
      layerNames: layerNames,
      icon: "Geodatensatz",
    };
  }

  private getRefUuids(): string[] {
    return this.formControl.value
      .filter((item: any) => item.uuid)
      .map((item: any) => item.uuid);
  }

  editItem(index: number, isExternalRef: boolean) {
    if (isExternalRef) this.showExternalRefDialog(index);
    else this.showInternalRefDialog(index);
  }
}
