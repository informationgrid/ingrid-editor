import { SpatialListComponent } from "./spatial-list.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";

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
