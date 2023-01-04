import { ChooseAddressDialogComponent } from "./choose-address-dialog.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef,
} from "@angular/material/legacy-dialog";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { CodelistService } from "../../../../services/codelist/codelist.service";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { DocumentService } from "../../../../services/document/document.service";

describe("ChooseAddressDialogComponent", () => {
  let spectator: Spectator<ChooseAddressDialogComponent>;
  const createHost = createComponentFactory({
    component: ChooseAddressDialogComponent,
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: MatDialogRef, useValue: {} },
    ],
    imports: [
      MatDialogModule,
      MatTabsModule,
      MatRadioModule,
      MatFormFieldModule,
      MatSelectModule,
    ],
    mocks: [CodelistService, DocumentService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  xit("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
