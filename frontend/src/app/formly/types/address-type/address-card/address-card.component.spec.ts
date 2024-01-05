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
import { AddressCardComponent } from "./address-card.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatCardModule } from "@angular/material/card";
import { CodelistPipe } from "../../../../directives/codelist.pipe";
import { CodelistService } from "../../../../services/codelist/codelist.service";
import { MatDialogModule } from "@angular/material/dialog";
import { ProfileService } from "../../../../services/profile.service";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { DocumentIconModule } from "../../../../shared/document-icon/document-icon.module";
import { getTranslocoModule } from "../../../../transloco-testing.module";

describe("AddressCardComponent", () => {
  let spectator: Spectator<AddressCardComponent>;
  const createHost = createComponentFactory({
    component: AddressCardComponent,
    imports: [
      MatCardModule,
      MatDialogModule,
      MatIconTestingModule,
      DocumentIconModule,
      getTranslocoModule(),
    ],
    declarations: [CodelistPipe],
    componentMocks: [CodelistService, ProfileService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should show tooltip when address is in draft state", () => {
    spectator.setInput("address", {
      type: { key: "1" },
      ref: { organization: "Test-Address1", _state: "W" },
    });
    spectator.detectChanges();

    expect(spectator.component.stateInfo).toBe(
      "Die Adresse ist nicht veröffentlicht. Ein veröffentlichen des Datensatzes ist aktuell nicht möglich.",
    );
  });

  it("should show tooltip when address is in draftAndPublished state", () => {
    spectator.setInput("address", {
      type: { key: "1" },
      ref: { organization: "Test-Address", _state: "PW" },
    });
    spectator.detectChanges();

    expect(spectator.component.stateInfo).toBe(
      "Für die Adresse existiert eine Bearbeitungskopie. Für die Veröffentlichung des Datensatzes wird die veröffentlichte Adresse verwendet. Bitte veröffentlichen Sie die Adresse, um die Daten aktuell zu halten.",
    );
  });

  it("should not show tooltip when address is in published state", () => {
    spectator.setInput("address", {
      type: { key: "1" },
      ref: { organization: "Test-Address", _state: "P" },
    });
    spectator.detectChanges();

    expect(spectator.component.stateInfo).toBe("");
  });
});
