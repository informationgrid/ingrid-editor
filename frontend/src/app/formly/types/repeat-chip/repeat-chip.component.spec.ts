import { RepeatChipComponent } from "./repeat-chip.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";

describe("RepeatChipComponent", () => {
  let spectator: Spectator<RepeatChipComponent>;
  const createHost = createComponentFactory({
    component: RepeatChipComponent,
    imports: [MatDialogModule, MatChipsModule],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
