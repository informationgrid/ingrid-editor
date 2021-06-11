import { CatalogManagementComponent } from "./catalog-management.component";
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { CodelistService } from "../../services/codelist/codelist.service";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { of } from "rxjs";
import { AddButtonModule } from "../../shared/add-button/add-button.module";

describe("CatalogManagementComponent", () => {
  let spectator: Spectator<CatalogManagementComponent>;
  const createHost = createComponentFactory({
    component: CatalogManagementComponent,
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      MatDialogModule,
      AddButtonModule,
    ],
    providers: [
      mockProvider(CodelistService),
      mockProvider(CatalogService, {
        getCatalogProfiles: () => of([]),
      }),
    ],
    mocks: [],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
