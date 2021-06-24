import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";

export interface PasteDialogOptions {
  buttonText: string;
  titleText: string;
  contentText: string;
  disabledCondition: any;
  forAddress: boolean;
}

@Component({
  templateUrl: "./paste-dialog.component.html",
  styleUrls: ["./paste-dialog.component.scss"],
})
export class PasteDialogComponent implements OnInit {
  selection: string = null;
  path: string[];
  query: TreeQuery | AddressTreeQuery;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PasteDialogOptions,
    treeQuery: TreeQuery,
    addressTreeQuery: AddressTreeQuery
  ) {
    this.query = data.forAddress ? addressTreeQuery : treeQuery;
  }

  ngOnInit() {}

  handleSelected(evt: any) {
    this.selection = evt;
  }
}
