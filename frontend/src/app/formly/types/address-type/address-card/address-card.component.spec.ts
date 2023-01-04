import { AddressCardComponent } from "./address-card.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { CodelistPipe } from "../../../../directives/codelist.pipe";
import { CodelistService } from "../../../../services/codelist/codelist.service";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { ProfileService } from "../../../../services/profile.service";
import { MatIconTestingModule } from "@angular/material/icon/testing";

describe("AddressCardComponent", () => {
  let spectator: Spectator<AddressCardComponent>;
  const createHost = createComponentFactory({
    component: AddressCardComponent,
    imports: [MatCardModule, MatDialogModule, MatIconTestingModule],
    declarations: [CodelistPipe],
    componentMocks: [CodelistService, ProfileService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
