/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Component, OnInit } from "@angular/core";
import { CatalogQuery } from "../../store/catalog/catalog.query";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { UserService } from "../../services/user/user.service";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { map, tap } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

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
          }) as SelectOptionUi,
      ),
    ),
  );

  constructor(
    private catalogService: CatalogService,
    private catalogQuery: CatalogQuery,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {}

  assignCatalog() {
    this.userService
      .assignUserToCatalog(this.selectedUserId, this.selectedCatalogId)
      .pipe(
        tap(() =>
          this.snackBar.open(
            `Katalog ${this.selectedCatalogId} wurde Nutzer ${this.selectedUserId} zugewiesen`,
          ),
        ),
      )
      .subscribe();
  }
}
