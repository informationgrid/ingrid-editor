import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { Catalog } from "../../../+catalog/services/catalog.model";
import { User } from "../../../+user/user";
import { UserService } from "../../../services/user/user.service";
import { CatalogService } from "../../../+catalog/services/catalog.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { NewCatalogDialogComponent } from "../new-catalog/new-catalog-dialog.component";

export interface CatalogDetailResponse {
  deleted?: boolean;
  settings?: Catalog;
  adminUsers?: string[];
}

@Component({
  selector: "ige-catalog-detail",
  templateUrl: "./catalog-detail.component.html",
  styleUrls: ["./catalog-detail.component.scss"],
})
export class CatalogDetailComponent implements OnInit {
  catAdmins: User[];

  constructor(
    public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public catalog: Catalog,
    private dialog: MatDialog,
    private userService: UserService,
    private catalogService: CatalogService,
  ) {}

  ngOnInit() {
    this.userService.getCatAdmins(this.catalog.id).subscribe((catAdmins) => {
      this.catAdmins = catAdmins;
    });

    this.catalogService.getCatalog(this.catalog.id);
  }

  submit() {
    const response: CatalogDetailResponse = {
      settings: this.catalog,
    };
    this.dialogRef.close(response);
  }

  deleteCatalog() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Katalog löschen",
          message: "Wollen Sie den Katalog wirklich löschen?",
          confirmText: "Löschen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Löschen",
              id: "confirm",
              emphasize: true,
              alignRight: true,
              disabledWhenNotConfirmed: true,
            },
          ],
        } as ConfirmDialogData,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          const response: CatalogDetailResponse = { deleted: true };
          this.dialogRef.close(response);
        }
      });
  }
}
