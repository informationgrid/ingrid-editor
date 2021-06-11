import { waitForAsync } from "@angular/core/testing";

import { CatalogDetailComponent } from "./catalog-detail.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
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

  beforeEach(
    waitForAsync(() => {
      spectator = createHost();
    })
  );

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
