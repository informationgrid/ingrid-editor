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
import { MatSelectHarness } from "@angular/material/select/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatSelectModule } from "@angular/material/select";
import { of } from "rxjs";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Codelist } from "../../store/codelist/codelist.model";

describe("CatalogCodelistsComponent", () => {
  let spectator: Spectator<CatalogCodelistsComponent>;
  let select: MatSelectHarness;
  let initCodelists: Codelist[] = [
    {
      id: "1",
      name: "One",
      entries: [
        { id: "r1", fields: { de: "Eins A" }, description: "" },
        { id: "r2", fields: { de: "Zwei A" }, description: "" },
      ],
      default: null,
    },
    { id: "2", name: "Two", entries: [], default: null },
  ];
  let initCatalogCodelists: Codelist[] = [
    {
      id: "10",
      name: "Cat Zehn",
      entries: [{ id: "a1", fields: { de: "Cat Eins A" }, description: "" }],
      default: null,
    },
  ];

  const createHost = createComponentFactory({
    component: CatalogCodelistsComponent,
    imports: [
      MatDialogModule,
      MatSnackBarModule,
      FilterSelectModule,
      CodelistPresenterModule,
      PageTemplateModule,
      MatSelectModule,
      NgxMatSelectSearchModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
    ],
    providers: [
      CodelistService,
      mockProvider(CodelistQuery, {
        hasCatalogCodelists$: of(true),
        catalogCodelists$: of(initCatalogCodelists),
        getCatalogCodelist(id: string): Codelist {
          return initCatalogCodelists.find((it) => it.id === id);
        },
        getEntity(id: string): Codelist {
          return initCodelists.find((it) => it.id === id);
        },
        selectAll: () => of(initCodelists),
      }),
    ],
    detectChanges: false,
  });

  beforeEach(async () => {
    spectator = createHost();
    // codelistQuery = TestBed.inject(CodelistQuery);

    spectator.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    select = await loader.getHarness(MatSelectHarness);
  });

  xit("should create with success", () => {
    expect(spectator).toBeTruthy();
  });

  it("should show both kinds of codelists (catalog and from repo)", async () => {
    await select.open();
    const options = await select.getOptions();
    expect(options.length).toBe(4);
  });

  it("should show entries for a catalog codelist", async () => {
    await select.open();
    await select.clickOptions({ text: "Cat Zehn (10)" });
    const items = spectator.queryAll("mat-expansion-panel");
    expect(items.length).toBe(1);
  });

  it("should show entries for a repo codelist", async () => {
    await select.open();
    await select.clickOptions({ text: "One (1)" });
    const items = spectator.queryAll("mat-expansion-panel");
    expect(items.length).toBe(2);
  });
});
