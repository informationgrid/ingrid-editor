import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { OptionListComponent } from "./option-list.component";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";

describe("OptionListComponent", () => {
  let spectator: Spectator<OptionListComponent>;
  const createComponent = createComponentFactory({
    component: OptionListComponent,
    imports: [MatSelectModule, MatListModule],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
