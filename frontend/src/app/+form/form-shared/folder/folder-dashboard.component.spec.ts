import { FolderDashboardComponent } from "./folder-dashboard.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { RouterTestingModule } from "@angular/router/testing";
import { DocumentService } from "../../../services/document/document.service";
import { FormToolbarService } from "../toolbar/form-toolbar.service";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";

describe("FolderDashboardComponent", () => {
  let spectator: Spectator<FolderDashboardComponent>;
  const createComponent = createComponentFactory({
    component: FolderDashboardComponent,
    imports: [RouterTestingModule, MatDialogModule],
    mocks: [DocumentService, FormToolbarService],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  xit("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
