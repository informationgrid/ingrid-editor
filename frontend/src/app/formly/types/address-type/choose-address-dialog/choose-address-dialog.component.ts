import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { CodelistService } from "../../../../services/codelist/codelist.service";
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

  showTypeSelector = true;
  selection: DocumentAbstract;
  selectedType: string;
  selectedNode = new BehaviorSubject<string>(null);
  recentAddresses$: Observable<DocumentAbstract[]>;
  placeholder: string;

  types = this.codelistQuery.selectEntity("505").pipe(
    map(CodelistService.mapToSelectSorted),
    tap(() => (this.placeholder = "Bitte wählen ..."))
  );

  disabledCondition: (TreeNode) => boolean = (node: TreeNode) => {
    return node.type === "FOLDER";
  };

  constructor(
    private addressTreeQuery: AddressTreeQuery,
    @Inject(MAT_DIALOG_DATA) private address: AddressRef,
    private codelistQuery: CodelistQuery,
    private codelistService: CodelistService,
    private configService: ConfigService,
    private sessionQuery: SessionQuery,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef,
    private dlgRef: MatDialogRef<ChooseAddressDialogComponent>
  ) {}

  ngOnInit(): void {
    this.configService.$userInfo
      .pipe(untilDestroyed(this))
      .subscribe((userInfo) => {
        if (userInfo.currentCatalog.type === "mcloud") {
          this.showTypeSelector = false;
          this.selectedType = "10"; // Herausgeber
        }
      });
    this.codelistService.byId("505");
    this.recentAddresses$ = this.sessionQuery.recentAddresses$.pipe(
      map((allRecent) => {
        const catalogId =
          this.configService.$userInfo.getValue().currentCatalog.id;
        return allRecent[catalogId] ?? [];
      })
    );

    // the tree is not updated correctly
    // FIXME: Find out why tree is not updated
    setTimeout(() => {
      this.updateModel(this.address);
      this.cdr.detectChanges();
    }, 100);
  }

  updateAddressTree(addressId: string) {
    this.selection = this.addressTreeQuery.getEntity(addressId);
  }

  updateAddressList(address: DocumentAbstract) {
    this.selection = address;
  }

  getResult(): void {
    this.documentService.addToRecentAddresses(this.selection);

    this.dlgRef.close({
      type: this.selectedType,
      address: this.selection,
    });
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
}
