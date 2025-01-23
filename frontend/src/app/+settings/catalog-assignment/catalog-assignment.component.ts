/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, inject } from "@angular/core";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { UserService } from "../../services/user/user.service";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { map, tap } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { toSignal } from "@angular/core/rxjs-interop";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { FilterSelectComponent } from "../../shared/filter-select/filter-select.component";
import { MatButton } from "@angular/material/button";
import { Catalog } from "../../+catalog/services/catalog.model";

@Component({
  selector: "ige-catalog-assignment",
  templateUrl: "./catalog-assignment.component.html",
  styleUrls: ["./catalog-assignment.component.scss"],
  imports: [PageTemplateComponent, FilterSelectComponent, MatButton],
})
export class CatalogAssignmentComponent {
  private catalogService = inject(CatalogService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  selectedCatalogId: string;
  selectedUserId: string;

  catalogs$ = toSignal(
    this.catalogService
      .getCatalogs()
      .pipe(map((catalogs) => this.mapCatalogs(catalogs))),
  );
  userIds$ = toSignal(
    this.userService
      .getUserIdsFromAllCatalogs()
      .pipe(map((ids) => this.mapIdsToSelectOptions(ids))),
  );

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

  private mapCatalogs(catalogs: Catalog[]): SelectOptionUi[] {
    return catalogs.map(
      (c) =>
        ({
          label: c.label,
          value: c.id,
        }) as SelectOptionUi,
    );
  }

  private mapIdsToSelectOptions(ids: String[]) {
    return ids.map(
      (id) =>
        ({
          label: id,
          value: id,
        }) as SelectOptionUi,
    );
  }
}
