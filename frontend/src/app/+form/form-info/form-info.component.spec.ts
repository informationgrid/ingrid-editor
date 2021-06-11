import { FormInfoComponent } from "./form-info.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { ProfileService } from "../../services/profile.service";
import { DocumentService } from "../../services/document/document.service";
import { TreeService } from "../sidebars/tree/tree.service";
import { MatDialogModule } from "@angular/material/dialog";

describe("FormInfoComponent", () => {
  let spectator: Spectator<FormInfoComponent>;
  let configService: ProfileService;

  const createHost = createComponentFactory({
    component: FormInfoComponent,
    imports: [MatDialogModule],
    mocks: [DocumentService, TreeService, ProfileService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
    configService = spectator.inject(ProfileService);
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
