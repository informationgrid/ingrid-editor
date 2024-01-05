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
import { TestBed } from "@angular/core/testing";

import { CatalogCodelistsComponent } from "./catalog-codelists.component";
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { MatDialogModule } from "@angular/material/dialog";
import { CodelistService } from "../../services/codelist/codelist.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FilterSelectModule } from "../../shared/filter-select/filter-select.module";
import { CodelistPresenterModule } from "../../shared/codelist-presenter/codelist-presenter.module";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { CodelistQuery } from "../../store/codelist/codelist.query";

describe("CatalogCodelistsComponent", () => {
  let spectator: Spectator<CatalogCodelistsComponent>;
  let codelistQuery: CodelistQuery;

  const createHost = createComponentFactory({
    component: CatalogCodelistsComponent,
    imports: [
      MatDialogModule,
      MatSnackBarModule,
      FilterSelectModule,
      CodelistPresenterModule,
      PageTemplateModule,
    ],
    providers: [mockProvider(CodelistService), CodelistQuery],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
    codelistQuery = TestBed.inject(CodelistQuery);
  });

  it("should create with success", () => {
    expect(spectator).toBeTruthy();
  });
});
