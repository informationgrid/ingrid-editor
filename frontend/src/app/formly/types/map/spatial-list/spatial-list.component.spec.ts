import { SpatialListComponent } from "./spatial-list.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";

describe("SpatialListComponent", () => {
  let spectator: Spectator<SpatialListComponent>;
  const createHost = createComponentFactory({
    component: SpatialListComponent,
    imports: [MatDialogModule, MatListModule],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
