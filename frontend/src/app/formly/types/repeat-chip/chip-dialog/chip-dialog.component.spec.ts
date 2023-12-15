/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { ChipDialogComponent } from "./chip-dialog.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatListModule } from "@angular/material/list";

describe("ChipDialogComponent", () => {
  let spectator: Spectator<ChipDialogComponent>;
  const createHost = createComponentFactory({
    component: ChipDialogComponent,
    imports: [MatDialogModule, MatSelectModule, MatListModule],
    providers: [{ provide: MAT_DIALOG_DATA, useValue: [] }],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
