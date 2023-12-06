import { FormDialogComponent } from "./form-dialog.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { MatRadioModule } from "@angular/material/radio";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormlyModule } from "@ngx-formly/core";

describe("FormDialogComponent", () => {
  let spectator: Spectator<FormDialogComponent>;
  const createHost = createComponentFactory({
    component: FormDialogComponent,
    providers: [
      {
        provide: MatDialogRef,
        useValue: {},
      },
      { provide: MAT_DIALOG_DATA, useValue: { model: {} } },
    ],
    imports: [
      MatTabsModule,
      MatRadioModule,
      MatFormFieldModule,
      MatDialogModule,
      FormlyModule,
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
