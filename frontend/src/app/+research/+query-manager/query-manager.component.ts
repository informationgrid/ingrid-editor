import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { QueryQuery } from "../../store/query/query.query";
import { ResearchService } from "../research.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Query } from "../../store/query/query.model";

@Component({
  selector: "ige-query-manager",
  templateUrl: "./query-manager.component.html",
  styleUrls: ["./query-manager.component.scss"],
})
export class QueryManagerComponent implements OnInit {
  @Output() selection = new EventEmitter<string>();

  userQueries = this.queryQuery.selectAll();

  constructor(
    private queryQuery: QueryQuery,
    private dialog: MatDialog,
    private researchService: ResearchService
  ) {}

  ngOnInit(): void {}

  removeQuery(id: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie die Anfrage wirklich löschen`,
          title: "Löschen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        this.researchService.removeQuery(id).subscribe();
      });
  }

  load(id: string) {
    this.selection.emit(id);
  }

  getIdentifier(index, item: Query) {
    return item.id;
  }
}
