import { Component, Inject, OnInit } from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { tap } from "rxjs/operators";
import { TreeNode } from "../../../../../store/tree/tree-node.model";

export interface ReplaceAddressDialogData {
  source: string;
  showInfo: boolean;
  currentCatalog: string;
}

@Component({
  selector: "ige-replace-address-dialog",
  templateUrl: "./replace-address-dialog.component.html",
  styleUrls: ["./replace-address-dialog.component.scss"],
})
export class ReplaceAddressDialogComponent implements OnInit {
  page = 0;
  selectedAddress: string[];
  currentCatalog: string;
  private source: string;
  showInfo = true;
  disableTreeNode = (node: TreeNode) =>
    node._uuid === this.source || node.state === "W";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReplaceAddressDialogData,
    private documentService: DocumentService
  ) {
    this.source = data.source;
    this.showInfo = data.showInfo;
    this.currentCatalog = data.currentCatalog;
  }

  ngOnInit(): void {}

  replaceAddress() {
    this.documentService
      .replaceAddress(this.source, this.selectedAddress[0])
      .pipe(tap(() => this.reloadAddress()))
      .subscribe(() => this.page++);
  }

  private reloadAddress() {
    this.documentService.reload$.next({
      uuid: this.source,
      forAddress: true,
    });
  }
}
