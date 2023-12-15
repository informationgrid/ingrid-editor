/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
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
    private config: ConfigService,
    private dlgRef: MatDialogRef<PasteDialogComponent>,
  ) {
    this.query = data.forAddress ? addressTreeQuery : treeQuery;
  }

  ngOnInit() {}

  handleSelected(evt: any) {
    this.selection = evt;
  }

  submit() {
    this.dlgRef.close({ selection: this.selection, path: this.path });
  }
}
