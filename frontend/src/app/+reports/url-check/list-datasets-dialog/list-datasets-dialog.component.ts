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
