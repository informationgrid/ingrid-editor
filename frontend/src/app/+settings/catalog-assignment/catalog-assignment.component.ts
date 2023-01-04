import { Component, OnInit } from "@angular/core";
import { ConfigService } from "../../services/config/config.service";
import { CatalogQuery } from "../../store/catalog/catalog.query";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { Catalog } from "../../+catalog/services/catalog.model";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { SessionService } from "../../services/session.service";
import { UserService } from "../../services/user/user.service";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { map, tap } from "rxjs/operators";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";

@Component({
  selector: "ige-catalog-assignment",
  templateUrl: "./catalog-assignment.component.html",
  styleUrls: ["./catalog-assignment.component.scss"],
})
export class CatalogAssignmentComponent implements OnInit {
  selectedCatalogId: string;
  selectedUserId: string;
  catalogs$ = this.catalogService.getCatalogs();
  userIds$ = this.userService.getUserIdsFromAllCatalogs().pipe(
    map((ids) =>
      ids.map(
        (id) =>
          ({
            label: id,
            value: id,
          } as SelectOptionUi)
      )
    )
  );

  constructor(
    private catalogService: CatalogService,
    private catalogQuery: CatalogQuery,
    private userService: UserService,
    private toast: MatSnackBar
  ) {}

  ngOnInit() {}

  assignCatalog() {
    this.userService
      .assignUserToCatalog(this.selectedUserId, this.selectedCatalogId)
      .pipe(
        tap(() =>
          this.toast.open(
            `Katalog ${this.selectedCatalogId} wurde Nutzer ${this.selectedUserId} zugewiesen`
          )
        )
      )
      .subscribe();
  }
}
