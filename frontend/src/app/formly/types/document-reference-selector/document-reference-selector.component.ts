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
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { catchError, debounceTime, map, startWith } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { DocumentState, IgeDocument } from "../../../models/ige-document";
import { firstValueFrom, of } from "rxjs";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";
import { DocumentIconComponent } from "../../../shared/document-icon/document-icon.component";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import {
  SelectDatasetData,
  SelectorServiceDialogComponent,
  SelectServiceResponse,
} from "./selector-service-dialog/selector-service-dialog.component";
import { FieldType } from "@ngx-formly/material";
import { ConfigService } from "../../../services/config/config.service";
import { DocumentReference } from "../document-reference-type/document-reference-type.component";

interface Reference {
  layerNames: string[];
  isExternalRef: boolean;
}

export interface SelectedDocumentReference extends Reference {
  title: string;
  uuid: string;
  state: DocumentState;
  type: string;
  icon: string;
}

interface UrlReference extends Reference {
  title: string;
  url: string;
}

@UntilDestroy()
@Component({
  selector: "ige-document-reference-selector",
  templateUrl: "./document-reference-selector.component.html",
  styleUrl: "./document-reference-selector.component.scss",
  standalone: true,
  imports: [
    FormErrorComponent,
    AddButtonComponent,
    DocumentIconComponent,
    MatIcon,
    MatIconButton,
    MatMenu,
    FormlyModule,
    MatMenuTrigger,
    MatProgressSpinner,
    MatMenuItem,
    MatButton,
  ],
})
export class DocumentReferenceSelectorComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  myModel: (SelectedDocumentReference | UrlReference)[];
  allowMultiSelect = false;
  allowRedirectToDocument = false;
  titleOfDocumentSelectorDialog: "Dokument auswählen";
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
        startWith(<any[]>this.formControl.value || <any>this.formControl.value),
        debounceTime(10),
      )
      .subscribe((_) => this.buildModel());
  }

  private async buildModel() {
    this.allowMultiSelect = this.props.allowMultiSelect;
    this.allowRedirectToDocument = this.props.allowRedirectToDocument;
    this.refreshing = true;
    this.titleOfDocumentSelectorDialog =
      this.props.titleOfDocumentSelectorDialog;

    if (this.allowMultiSelect) {
      if (this.formControl.value == undefined) {
        this.formControl.setValue([]);
      }
      this.myModel = await Promise.all(
        (this.formControl.value as any[]).map(async (item: any) => {
          return this.mapInternalRef(item);
        }),
      );
    } else {
      if (this.formControl.value) {
        let item = await this.mapInternalRef(<SelectedDocumentReference>{
          title: `???`,
          uuid: this.formControl?.value as string,
          type: "",
          icon: "",
          layerNames: null,
          isExternalRef: false,
          state: "W",
        });
        this.myModel = [];
        this.myModel.push(item);
      }
    }
    this.refreshing = false;
    this.cdr.detectChanges();
  }

  showInternalRefDialog(index?: number) {
    const data: SelectDatasetData = {
      currentRefs: this.getRefUuids().filter((item, idx) => idx !== index),
      activeRef: index >= 0 ? this.getRefUuids()[index] : null,
      layerNames: index >= 0 ? this.formControl.value[index].layerNames : [],
      showLayernames: this.props.showLayernames,
      allowMultiSelect: this.props.allowMultiSelect,
      docTypeFilter: this.props.docTypeFilter,
      titleOfDocumentSelectorDialog: this.props.titleOfDocumentSelectorDialog,
    };
    this.dialog
      .open(SelectorServiceDialogComponent, {
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

  private updateValue(item: any, index?: number) {
    if (this.allowMultiSelect) {
      const isNotNew = index >= 0;
      let docArray: any[] = this.formControl.value;
      if (isNotNew) {
        docArray.splice(index, 1);
      }
      docArray.push(item);
      setTimeout(() => this.formControl.setValue(docArray));
    } else {
      setTimeout(() => this.formControl.setValue(item.uuid));
    }
    this.props.change?.(this.field);
  }

  private async mapInternalRef(
    item: SelectedDocumentReference,
  ): Promise<SelectedDocumentReference> {
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
        catchError((error) => {
          console.error(`UUID not found: ${item.uuid}`, error);
          return of(<SelectedDocumentReference>{
            title: `???`,
            uuid: item.uuid,
            type: "",
            icon: null,
            layerNames: null,
            isExternalRef: false,
            state: null,
          });
        }),
      ),
    );
  }

  private mapToDocumentReference(
    doc: IgeDocument,
    layerNames: string[],
  ): SelectedDocumentReference {
    return {
      uuid: doc?._uuid,
      isExternalRef: false,
      title: doc?.title,
      state: doc?._state,
      type: doc?._type,
      layerNames: layerNames,
      icon: doc?.icon,
    };
  }

  private getRefUuids(): string[] {
    if (this.allowMultiSelect) {
      return this.formControl.value
        .filter((item: any) => item.uuid)
        .map((item: any) => item.uuid);
    } else {
      let uuids: string[] = [];
      uuids.push(this.formControl.value);
      return uuids;
    }
  }

  editItem(index: number, isExternalRef: boolean) {
    this.showInternalRefDialog(index);
  }

  removeItem(index: number, event: MouseEvent) {
    event.stopImmediatePropagation();
    this.myModel.splice(index, 1);
    this.props.change?.(this.field, event);
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
}
