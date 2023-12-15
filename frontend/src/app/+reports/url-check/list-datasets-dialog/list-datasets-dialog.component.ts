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
import { UrlCheckReportDataset } from "../url-check.service";

export interface ListDatasetsDialogData {
  datasets: UrlCheckReportDataset[];
  link: string;
}

@Component({
  selector: "ige-list-datasets-dialog",
  templateUrl: "./list-datasets-dialog.component.html",
  styleUrls: ["./list-datasets-dialog.component.scss"],
})
export class ListDatasetsDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ListDatasetsDialogData,
    private dlgRef: MatDialogRef<ListDatasetsDialogComponent, string>,
  ) {}

  ngOnInit(): void {}

  close(uuid: string) {
    this.dlgRef.close(uuid);
  }
}
