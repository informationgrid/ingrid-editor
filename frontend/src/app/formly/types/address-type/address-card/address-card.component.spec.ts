import { AddressCardComponent } from "./address-card.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatCardModule } from "@angular/material/card";
import { CodelistPipe } from "../../../../directives/codelist.pipe";
import { CodelistService } from "../../../../services/codelist/codelist.service";
import { MatDialogModule } from "@angular/material/dialog";
import { ProfileService } from "../../../../services/profile.service";

describe("AddressCardComponent", () => {
  let spectator: Spectator<AddressCardComponent>;
  const createHost = createComponentFactory({
    component: AddressCardComponent,
    imports: [MatCardModule, MatDialogModule],
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
