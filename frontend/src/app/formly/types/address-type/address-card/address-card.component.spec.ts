import { AddressCardComponent } from "./address-card.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatCardModule } from "@angular/material/card";
import { CodelistPipe } from "../../../../directives/codelist.pipe";
import { CodelistService } from "../../../../services/codelist/codelist.service";
import { MatDialogModule } from "@angular/material/dialog";
import { ProfileService } from "../../../../services/profile.service";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { DocumentIconModule } from "../../../../shared/document-icon/document-icon.module";

describe("AddressCardComponent", () => {
  let spectator: Spectator<AddressCardComponent>;
  const createHost = createComponentFactory({
    component: AddressCardComponent,
    imports: [
      MatCardModule,
      MatDialogModule,
      MatIconTestingModule,
      DocumentIconModule,
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
      "Die Adresse ist nicht veröffentlicht. Ein veröffentlichen des Datensatzes ist aktuell nicht möglich."
    );
  });

  it("should show tooltip when address is in draftAndPublished state", () => {
    spectator.setInput("address", {
      type: { key: "1" },
      ref: { organization: "Test-Address", _state: "PW" },
    });
    spectator.detectChanges();

    expect(spectator.component.stateInfo).toBe(
      "Für die Adresse existiert eine Bearbeitungskopie. Für die Veröffentlichung des Datensatzes wird die veröffentlichte Adresse verwendet. Bitte veröffentlichen Sie die Adresse, um die Daten aktuell zu halten."
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
