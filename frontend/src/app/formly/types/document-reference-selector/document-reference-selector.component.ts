/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { FieldTypeConfig, FormlyValidationMessage } from "@ngx-formly/core";
import { catchError, debounceTime, map, startWith } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { firstValueFrom, of } from "rxjs";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { DocumentIconComponent } from "../../../shared/document-icon/document-icon.component";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import {
  SelectDatasetData,
  TreeDialogComponent,
  SelectServiceResponse,
} from "./tree-dialog/tree-dialog.component";
import { FieldType } from "@ngx-formly/material";
import { ConfigService } from "../../../services/config/config.service";
import { DocumentAbstract } from "../../../store/document/document.model";

interface DocumentReference {
  uuid: string;
  isExternalRef: boolean;
  title?: string;
}

@UntilDestroy()
@Component({
  selector: "ige-document-reference-selector",
  templateUrl: "./document-reference-selector.component.html",
  styleUrl: "./document-reference-selector.component.scss",
  imports: [
    FormErrorComponent,
    DocumentIconComponent,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuTrigger,
    MatProgressSpinner,
    MatMenuItem,
    MatButton,
    FormlyValidationMessage,
  ],
})
export class DocumentReferenceSelectorComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  myModel: (DocumentAbstract | DocumentReference)[];
  allowMultiSelect = false;
  allowRedirectToDocument = false;
  titleOfDocumentSelectorDialog: "Dokument auswählen";
  refreshing = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private docService: DocumentService,
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
    this.refreshing = true;
    this.allowMultiSelect = this.props.allowMultiSelect;
    this.allowRedirectToDocument = this.props.allowRedirectToDocument;
    this.titleOfDocumentSelectorDialog =
      this.props.titleOfDocumentSelectorDialog;

    if (this.allowMultiSelect) {
      if (this.formControl.value == undefined) {
        this.formControl.setValue([]);
      }
      this.myModel = await Promise.all(
        (this.formControl.value as any[]).map(async (item: any) => {
          return item.isExternalRef ? item : this.mapInternalRef(item);
        }),
      );
    } else {
      if (this.formControl.value == undefined) {
        this.formControl.setValue(null);
        this.myModel = [];
      } else {
        let item = this.formControl?.value.isExternalRef
          ? this.formControl?.value
          : await this.mapInternalRef({
              uuid: this.formControl?.value as string,
              isExternalRef: false,
            });
        this.myModel = [];
        this.myModel.push(item);
      }
    }
    this.refreshing = false;
    this.cdr.detectChanges();
  }

  showReferenceDialog(index?: number | string) {
    if (typeof index == "string") {
      index = 0;
    }

    const data: SelectDatasetData = {
      currentRefs: this.getRefUuids().filter((item, idx) => idx !== index),
      activeRef: index >= 0 ? this.getRefUuids()[index] : null,
      showLayernames: false,
      allowMultiSelect: this.props.allowMultiSelect,
      docTypeFilter: this.props.docTypeFilter,
      titleOfDocumentSelectorDialog: this.props.titleOfDocumentSelectorDialog,
      treeStore: this.props.treeStore,
      hideHeader: this.props.hideHeader,
    };
    this.dialog
      .open(TreeDialogComponent, {
        minWidth: 400,
        data: data,
      })
      .afterClosed()
      .subscribe((item: SelectServiceResponse) => {
        if (!item) return;
        this.updateValue(
          <DocumentReference>{
            title: item.isExternalRef ? item.title : undefined,
            uuid: item.uuid,
            isExternalRef: item.isExternalRef ?? false,
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
        docArray.splice(index, 1, item);
      } else {
        docArray.push(item);
      }
      setTimeout(() => this.formControl.setValue(docArray));
    } else {
      setTimeout(() =>
        this.formControl.setValue(
          item.isExternalRef
            ? {
                title: item.title,
                uuid: item.uuid,
                isExternalRef: true,
              }
            : item.uuid,
        ),
      );
    }
    this.props.change?.(this.field);
  }

  private async mapInternalRef(
    item: DocumentReference,
  ): Promise<DocumentAbstract | DocumentReference> {
    const treeStore = this.props.treeStore;
    const nodeEntity = treeStore.getByUuid(item.uuid);
    if (nodeEntity) {
      return nodeEntity;
    }
    return await firstValueFrom(
      this.docService.load(item.uuid, false, false, true).pipe(
        map((doc) => {
          return this.docService.mapToDocumentAbstracts([doc])[0];
        }),
        catchError((error) => {
          console.error(`UUID not found: ${item.uuid}`, error);
          return of({
            title: item.title ?? `???`,
            uuid: item.uuid,
            isExternalRef: item.isExternalRef,
          });
        }),
      ),
    );
  }

  private getRefUuids(): string[] {
    if (this.allowMultiSelect) {
      return this.formControl.value
        .filter((item: any) => item.uuid)
        .map((item: any) => item.uuid);
    } else {
      return [
        typeof this.formControl.value === "string"
          ? this.formControl.value
          : this.formControl.value?.uuid,
      ];
    }
  }

  editItem(index: number) {
    this.showReferenceDialog(index);
  }

  removeItem(index: number, event: MouseEvent) {
    event.stopImmediatePropagation();
    this.myModel.splice(index, 1);
    this.props.change?.(this.field, event);
    if (this.myModel.length == 0) {
      this.formControl.setValue(this.allowMultiSelect ? [] : null);
    } else {
      const newJson = this.myModel.map(
        (item: any) =>
          <DocumentReference>{
            title: item.isExternalRef ? item.title : undefined,
            uuid: item._uuid ?? item.uuid,
            isExternalRef: item.isExternalRef ?? false,
          },
      );
      setTimeout(() => this.formControl.setValue(newJson));
    }
  }

  async openReference(item: DocumentAbstract | DocumentReference) {
    if (this.formControl.disabled) return;

    if ((item as DocumentReference).isExternalRef) {
      console.log("Redirect to external source not yet implemented.");
      // window.open((<UrlReference>item).uuid, "_blank");
    } else {
      return this.router.navigate([
        `${ConfigService.catalogId}/form`,
        { id: (<DocumentAbstract>item)._uuid },
      ]);
    }
  }
}
