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
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { BehaviorSubject, Observable } from "rxjs";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../../services/codelist/codelist.service";
import { map, tap } from "rxjs/operators";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { ResolvedAddressWithType } from "../address-card/address-card.component";
import { DocumentService } from "../../../../services/document/document.service";
import { ConfigService } from "../../../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { IgeError } from "../../../../models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { BackendOption } from "../../../../store/codelist/codelist.model";
import { MatSelect } from "@angular/material/select";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TreeComponent } from "../../../../+form/sidebars/tree/tree.component";
import { DocumentListItemComponent } from "../../../../shared/document-list-item/document-list-item.component";
import { CodelistStore } from "../../../../store/codelist/codelist.store";
import { toObservable } from "@angular/core/rxjs-interop";
import { AddressTreeStore } from "../../../../store/address-tree/address-tree.store";
import { GeneralStore } from "../../../../store/general.store";

export interface ChooseAddressDialogData {
  address: ResolvedAddressWithType;
  allowedTypes: string[];
  allowedTypesByDoctype: { [key: string]: string[] } | null;
  skipToType: boolean;
  disabledCondition: (node: TreeNode) => boolean | null;
}

export interface ChooseAddressResponse {
  type: BackendOption;
  address: DocumentAbstract;
}

@UntilDestroy()
@Component({
  selector: "ige-choose-address-dialog",
  templateUrl: "./choose-address-dialog.component.html",
  styleUrls: ["./choose-address-dialog.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDrag,
    CdkDragHandle,
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    TreeComponent,
    DocumentListItemComponent,
    MatDialogActions,
    MatButton,
  ],
})
export class ChooseAddressDialogComponent implements OnInit, OnDestroy {
  private codelistStore = inject(CodelistStore);
  private addressTreeStore = inject(AddressTreeStore);
  private generalStore = inject(GeneralStore);
  @ViewChild(MatSelect) recentAddressSelect: MatSelect;
  selection = signal<DocumentAbstract>(null);
  selectedType: string;
  selectedNode = new BehaviorSubject<number>(null);
  recentAddresses$: Observable<DocumentAbstract[]> = toObservable(
    this.generalStore.recentAddresses,
  ).pipe(map((allRecent) => allRecent[ConfigService.catalogId] ?? []));
  initialActiveAddressType = new BehaviorSubject<Partial<any>>(null);
  typeSelectionEnabled = signal<boolean>(false);
  activeStep = 1;
  availableReferenceTypes: DocumentAbstract[];
  allowedReferenceTypes: DocumentAbstract[];
  private codelists$ = toObservable(this.codelistStore.entityMap);

  disabledCondition: (node: TreeNode) => boolean = (node: TreeNode) => {
    return node.type === "FOLDER";
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ChooseAddressDialogData,
    private codelistService: CodelistService,
    private documentService: DocumentService,
    private dlgRef: MatDialogRef<ChooseAddressDialogComponent>,
  ) {}

  ngOnInit(): void {
    if (this.data.disabledCondition != null)
      this.disabledCondition = this.data.disabledCondition;
    this.codelistService.byId("505");
    // disable the type selection if only one type is allowed for all doctypes
    this.typeSelectionEnabled.set(!(this.data.allowedTypes?.length === 1));
    this.codelists$
      .pipe(
        untilDestroyed(this),
        map((item) => item["505"]),
        map((codelist) => CodelistService.mapToSelect(codelist)),
        tap((items) => {
          this.availableReferenceTypes = this.prepareReferenceTypes(items);
          this.updateTypes();
        }),
      )
      .subscribe();

    this.updateModel(this.data.address);
    if (this.data.skipToType && this.typeSelectionEnabled()) {
      this.activeStep = 2;
    }
  }

  private updateTypes(): void {
    this.allowedReferenceTypes = this.filterByAllowedTypes(
      this.availableReferenceTypes,
    );
    this.preselectIfOnlyOneType(this.allowedReferenceTypes);
    this.typeSelectionEnabled.set(this.allowedReferenceTypes.length > 1);
    this.cdr.markForCheck();
  }

  private prepareReferenceTypes(result: SelectOptionUi[]): DocumentAbstract[] {
    return result
      .map((type) => {
        return {
          id: type.value,
          title: type.label,
          _state: "P",
        } as DocumentAbstract;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  updateAddressTree(addressId: number) {
    this.selection.set(this.addressTreeStore.entityMap()[addressId]);
    this.updateTypes();
  }

  getResult(): void {
    this.documentService.addToRecentAddresses(this.selection());

    const value = this.availableReferenceTypes.find(
      (item) => item.id === this.selectedType,
    ).title;
    this.dlgRef.close({
      type: { key: this.selectedType, value: value },
      address: this.selection(),
    });
  }

  private preselectIfOnlyOneType(items: DocumentAbstract[]) {
    if (items.length === 1) this.selectedType = items[0].id as string;
  }

  private updateModel(address: ResolvedAddressWithType) {
    if (!address) {
      return;
    }

    // in case the previous type is not allowed anymore, we use the new allowed type
    const isAllowed = this.isTypeAllowed(address.type?.key);
    if (isAllowed) {
      this.selectedType = address.type.key;
      this.initialActiveAddressType.next({
        id: this.selectedType,
      });
    }
    this.selectedNode.next(address.address.metadata.wrapperId);
  }

  ngOnDestroy(): void {}

  handleTreeError(error: HttpErrorResponse) {
    console.error(error);
    if (error.error.errorText === "No value present") {
      this.documentService.removeFromRecentAddresses(
        this.recentAddressSelect.value.id,
      );
      this.recentAddressSelect.value = null;
      throw new IgeError(
        "Die Adresse existiert nicht mehr oder Sie besitzen keine Rechte darauf. Sie wurde aus der Liste entfernt.",
      );
    }
    throw error;
  }

  private filterByAllowedTypes(items: DocumentAbstract[]) {
    const filterTypes =
      this.data.allowedTypesByDoctype?.[this.selection()?._type] ??
      this.data.allowedTypes;

    // if no allowed types are set, we return all
    if (!filterTypes) return items;

    return items.filter(
      (item) => filterTypes.indexOf(item.id as string) !== -1,
    );
  }

  setRefType($event: DocumentAbstract) {
    this.selectedType = $event.id.toString();
  }

  private isTypeAllowed(typeId: string) {
    return (
      this.filterByAllowedTypes([
        {
          id: typeId,
        } as DocumentAbstract,
      ]).length > 0
    );
  }
}
