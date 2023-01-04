import { SpatialDialogComponent } from "./spatial-dialog.component";
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { TreeComponent } from "../../../../+form/sidebars/tree/tree.component";
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef,
} from "@angular/material/legacy-dialog";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { FormFieldsModule } from "../../../../form-fields/form-fields.module";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";

describe("SpatialDialogComponent", () => {
  let spectator: Spectator<SpatialDialogComponent>;
  const createHost = createComponentFactory({
    component: SpatialDialogComponent,
    imports: [
      MatDialogModule,
      MatButtonModule,
      MatFormFieldModule,
      MatAutocompleteModule,
      FormFieldsModule,
      MatSelectModule,
    ],
    declarations: [],
    componentMocks: [],
    providers: [
      mockProvider(MatDialogRef),
      { provide: MAT_DIALOG_DATA, useValue: [] },
    ],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
