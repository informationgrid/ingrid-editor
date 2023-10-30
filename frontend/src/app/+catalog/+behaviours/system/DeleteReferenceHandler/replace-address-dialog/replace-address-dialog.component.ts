import { Component, Inject, OnInit } from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { map, tap } from "rxjs/operators";
import { TreeNode } from "../../../../../store/tree/tree-node.model";
import { Observable } from "rxjs";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../../dialogs/confirm/confirm-dialog.component";

export interface ReplaceAddressDialogData {
  source: string;
  showInfo: boolean;
}

@Component({
  selector: "ige-replace-address-dialog",
  templateUrl: "./replace-address-dialog.component.html",
  styleUrls: ["./replace-address-dialog.component.scss"],
})
export class ReplaceAddressDialogComponent implements OnInit {
  page = 0;
  selectedAddress: string[];
  private source: string;
  showInfo = true;
  disableTreeNode = (node: TreeNode) =>
    node._uuid === this.source || node.state === "W";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReplaceAddressDialogData,
    private documentService: DocumentService,
    private dialog: MatDialog,
  ) {
    this.source = data.source;
    this.showInfo = data.showInfo;
  }

  ngOnInit(): void {}

  replaceAddress(reaffirm: boolean = true) {
    if (reaffirm === true) {
      this.openConfirmReplaceAddressDialog().subscribe((confirmed) => {
        if (confirmed) {
          this.replaceAddress(false);
        } else {
          return;
        }
      });
    } else {
      this.documentService
        .replaceAddress(this.source, this.selectedAddress[0])
        .pipe(tap(() => this.reloadAddress()))
        .subscribe(() => this.page++);
    }
  }

  openConfirmReplaceAddressDialog(): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: (<ConfirmDialogData>{
          title: "Adresse ersetzen",
          message:
            "Achtung! Eine Adresse zu ersetzen ist nicht umkehrbar. \n Es kann im Nachhinein nicht mehr rekonstruiert werden, in welchen Datensätzen die Adresse ersetzt wurde.",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Adresse ersetzen",
              id: "confirm",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(
        map((response) => {
          return response === "confirm";
        }),
      );
  }

  private reloadAddress() {
    this.documentService.reload$.next({
      uuid: this.source,
      forAddress: true,
    });
  }
}
