import { FormInfoComponent } from "./form-info.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { ProfileService } from "../../services/profile.service";
import { DocumentService } from "../../services/document/document.service";
import { TreeService } from "../sidebars/tree/tree.service";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";
import { PublishPendingComponent } from "./publish-pending/publish-pending.component";
import { HeaderTitleRowComponent } from "./header-title-row/header-title-row.component";
import { FormMessageComponent } from "./form-message/form-message.component";
import { FormSharedModule } from "../form-shared/form-shared.module";

describe("FormInfoComponent", () => {
  let spectator: Spectator<FormInfoComponent>;
  let configService: ProfileService;

  const createHost = createComponentFactory({
    component: FormInfoComponent,
    imports: [MatDialogModule, MatIconTestingModule, FormSharedModule],
    mocks: [DocumentService, TreeService, ProfileService],
    declarations: [],
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
