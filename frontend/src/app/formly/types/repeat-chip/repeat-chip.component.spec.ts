import { RepeatChipComponent } from "./repeat-chip.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatDialogModule } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";

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
