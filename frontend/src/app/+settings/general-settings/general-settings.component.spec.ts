import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { GeneralSettingsComponent } from "./general-settings.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";

describe("GeneralSettingsComponent", () => {
  let spectator: Spectator<GeneralSettingsComponent>;
  const createComponent = createComponentFactory({
    component: GeneralSettingsComponent,
    imports: [
      MatFormFieldModule,
      MatCheckboxModule,
      MatInputModule,
      PageTemplateModule,
    ],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
