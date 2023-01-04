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
