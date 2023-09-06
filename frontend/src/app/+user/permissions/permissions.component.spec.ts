import { PermissionsComponent } from "./permissions.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { getTranslocoModule } from "../../transloco-testing.module";

describe("PermissionsComponent", () => {
  let spectator: Spectator<PermissionsComponent>;
  const createHost = createComponentFactory({
    component: PermissionsComponent,
    imports: [
      MatDialogModule,
      RouterTestingModule,
      ReactiveFormsModule,
      getTranslocoModule(),
    ],
    providers: [{ provide: MAT_DIALOG_DATA, useValue: [] }],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });

  xit("should display activated permissions", () => {});

  xit("should output permissions as JSON", () => {});
});
