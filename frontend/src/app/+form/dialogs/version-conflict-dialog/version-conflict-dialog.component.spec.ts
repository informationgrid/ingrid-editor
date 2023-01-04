import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { VersionConflictDialogComponent } from "./version-conflict-dialog.component";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { SharedModule } from "../../../shared/shared.module";

describe("VersionConflictDialogComponent", () => {
  let spectator: Spectator<VersionConflictDialogComponent>;
  const createComponent = createComponentFactory({
    component: VersionConflictDialogComponent,
    imports: [MatDialogModule, SharedModule],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
