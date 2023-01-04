import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { OptionListComponent } from "./option-list.component";
import { MatSelectModule } from "@angular/material/select";
import { MatListModule } from "@angular/material/list";

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
