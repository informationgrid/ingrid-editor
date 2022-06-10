import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { ConfigService } from "../../../services/config/config.service";

export interface PasteDialogOptions {
  buttonText: string;
  titleText: string;
  contentText: string;
  disabledCondition: any;
  forAddress: boolean;
  typeToInsert: string;
}

@Component({
  templateUrl: "./paste-dialog.component.html",
  styleUrls: ["./paste-dialog.component.scss"],
})
export class PasteDialogComponent implements OnInit {
  selection: string = null;
  path: string[];
  query: TreeQuery | AddressTreeQuery;
  hasWriteRootPermission = this.config.hasWriteRootPermission();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PasteDialogOptions,
    treeQuery: TreeQuery,
    addressTreeQuery: AddressTreeQuery,
    private config: ConfigService
  ) {
    this.query = data.forAddress ? addressTreeQuery : treeQuery;
  }

  ngOnInit() {}

  handleSelected(evt: any) {
    this.selection = evt;
  }
}
