import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { BehaviorSubject, Observable } from "rxjs";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { CodelistQuery } from "../../../../store/codelist/codelist.query";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../../services/codelist/codelist.service";
import { map, tap } from "rxjs/operators";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AddressRef } from "../address-card/address-card.component";
import { SessionQuery } from "../../../../store/session.query";
import { DocumentService } from "../../../../services/document/document.service";
import { ConfigService } from "../../../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { IgeError } from "../../../../models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSelect } from "@angular/material/select";
import { ProfileAbstract } from "../../../../store/profile/profile.model";

export interface ChooseAddressDialogData {
  address: AddressRef;
  allowedTypes: string[];
}

export interface ChooseAddressResponse {
  type: string;
  address: DocumentAbstract;
}

@UntilDestroy()
@Component({
  selector: "ige-choose-address-dialog",
  templateUrl: "./choose-address-dialog.component.html",
  styleUrls: ["./choose-address-dialog.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseAddressDialogComponent implements OnInit, OnDestroy {
  @ViewChild(MatSelect) recentAddressSelect: MatSelect;

  selection: DocumentAbstract;
  selectedType: string;
  selectedNode = new BehaviorSubject<string>(null);
  recentAddresses$: Observable<DocumentAbstract[]>;
  placeholder: string;

  typeSelectionEnabled = false;
  activeStep = 1;
  referenceTypes: DocumentAbstract[];

  disabledCondition: (TreeNode) => boolean = (node: TreeNode) => {
    return node.type === "FOLDER";
  };

  constructor(
    private addressTreeQuery: AddressTreeQuery,
    @Inject(MAT_DIALOG_DATA) private data: ChooseAddressDialogData,
    private codelistQuery: CodelistQuery,
    private codelistService: CodelistService,
    private configService: ConfigService,
    private sessionQuery: SessionQuery,
    private documentService: DocumentService,
    private dlgRef: MatDialogRef<ChooseAddressDialogComponent>
  ) {}

  ngOnInit(): void {
    this.codelistService.byId("505");
    this.codelistQuery
      .selectEntity("505")
      .pipe(
        untilDestroyed(this),
        map(CodelistService.mapToSelectSorted),
        map((items) => this.filterByAllowedTypes(items)),
        tap((items) => this.preselectIfOnlyOneType(items)),
        tap(
          (items) => (this.referenceTypes = this.prepareReferenceTypes(items))
        ),
        tap((items) => (this.typeSelectionEnabled = items.length > 1)),
        tap(() => (this.placeholder = "Bitte wählen ..."))
      )
      .subscribe();
    this.recentAddresses$ = this.sessionQuery.recentAddresses$.pipe(
      untilDestroyed(this),
      map((allRecent) => {
        const catalogId =
          this.configService.$userInfo.getValue().currentCatalog.id;
        return allRecent[catalogId] ?? [];
      })
    );

    this.updateModel(this.data.address);
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

  updateAddressTree(addressId: string) {
    this.selection = this.addressTreeQuery.getEntity(addressId);
  }

  updateAddressList(address: DocumentAbstract) {
    this.selection = address;
    this.selectedNode.next(address.id.toString());
  }

  getResult(): void {
    this.documentService.addToRecentAddresses(this.selection);

    this.dlgRef.close({
      type: { key: this.selectedType },
      address: this.selection,
    });
  }

  private preselectIfOnlyOneType(items: SelectOptionUi[]) {
    if (items.length === 1) this.selectedType = items[0].value;
  }

  private updateModel(address: AddressRef) {
    if (!address) {
      return;
    }

    this.selectedType = address.type;
    this.selectedNode.next(address.ref._id);
  }

  ngOnDestroy(): void {}

  handleTreeError(error: HttpErrorResponse) {
    console.error(error);
    if (error.error.errorText === "No value present") {
      // TODO: remove address from recentAddresses
      this.documentService.removeFromRecentAddresses(
        this.recentAddressSelect.value.id
      );
      this.recentAddressSelect.value = null;
      throw new IgeError(
        "Die Adresse existiert nicht mehr oder Sie besitzen keine Rechte darauf. Sie wurde aus der Liste entfernt."
      );
    }
    throw error;
  }

  private filterByAllowedTypes(items: SelectOptionUi[]) {
    if (!this.data.allowedTypes) return items;

    return items.filter(
      (item) => this.data.allowedTypes.indexOf(item.value) !== -1
    );
  }

  setRefType($event: DocumentAbstract) {
    this.selectedType = $event.id.toString();
  }
}
