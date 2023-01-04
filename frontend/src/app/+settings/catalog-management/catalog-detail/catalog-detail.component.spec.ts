import { waitForAsync } from "@angular/core/testing";

import { CatalogDetailComponent } from "./catalog-detail.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef,
} from "@angular/material/legacy-dialog";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { UserService } from "../../../services/user/user.service";
import { CatalogService } from "../../../+catalog/services/catalog.service";

describe("CatalogDetailComponent", () => {
  let spectator: Spectator<CatalogDetailComponent>;
  const createHost = createComponentFactory({
    component: CatalogDetailComponent,
    imports: [MatDialogModule, MatFormFieldModule, MatListModule],
    providers: [
      {
        provide: MatDialogRef,
        useValue: {},
      },
      { provide: MAT_DIALOG_DATA, useValue: [] },
    ],
    componentMocks: [UserService, CatalogService],
    detectChanges: false,
  });

  beforeEach(waitForAsync(() => {
    spectator = createHost();
  }));

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
