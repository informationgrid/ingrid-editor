import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { GeneralSettingsComponent } from "./general-settings.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";

describe("GeneralSettingsComponent", () => {
  let spectator: Spectator<GeneralSettingsComponent>;
  const createComponent = createComponentFactory({
    component: GeneralSettingsComponent,
    imports: [MatFormFieldModule, MatCheckboxModule, MatInputModule],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
