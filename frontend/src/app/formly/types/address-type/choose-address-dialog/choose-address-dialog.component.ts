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
  ChangeDetectorRef,
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
  SelectOption,
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
  skipToType: boolean;
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
  referenceTypes: DocumentAbstract[];
  private codelists$ = toObservable(this.codelistStore.entityMap);

  disabledCondition: (node: TreeNode) => boolean = (node: TreeNode) => {
    return node.type === "FOLDER";
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ChooseAddressDialogData,
    private codelistService: CodelistService,
    private documentService: DocumentService,
    private dlgRef: MatDialogRef<ChooseAddressDialogComponent>,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.codelistService.byId("505");
    this.codelists$
      .pipe(
        untilDestroyed(this),
        map((item) => item["505"]),
        map((codelist) => CodelistService.mapToSelect(codelist)),
        map((items) => this.filterByAllowedTypes(items)),
        tap((items) => this.preselectIfOnlyOneType(items)),
        tap(
          (items) => (this.referenceTypes = this.prepareReferenceTypes(items)),
        ),
        tap((items) => {
          this.typeSelectionEnabled.set(items.length > 1);
          this.cdr.markForCheck();
        }),
      )
      .subscribe();

    this.updateModel(this.data.address);
    if (this.data.skipToType && this.typeSelectionEnabled()) {
      this.activeStep = 2;
    }
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
  }

  getResult(): void {
    this.documentService.addToRecentAddresses(this.selection());

    this.dlgRef.close({
      type: { key: this.selectedType },
      address: this.selection(),
    });
  }

  private preselectIfOnlyOneType(items: SelectOptionUi[]) {
    if (items.length === 1) this.selectedType = items[0].value;
  }

  private updateModel(address: ResolvedAddressWithType) {
    if (!address) {
      return;
    }

    // in case the previous type is not allowed anymore, we use the new allowed type
    const isAllowed = this.isTypeAllowed(address);
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

  private filterByAllowedTypes(items: SelectOptionUi[]) {
    if (!this.data.allowedTypes) return items;

    return items.filter(
      (item) => this.data.allowedTypes.indexOf(item.value) !== -1,
    );
  }

  setRefType($event: DocumentAbstract) {
    this.selectedType = $event.id.toString();
  }

  private isTypeAllowed(address: ResolvedAddressWithType) {
    return (
      this.filterByAllowedTypes([new SelectOption(address.type?.key, "")])
        .length > 0
    );
  }
}
