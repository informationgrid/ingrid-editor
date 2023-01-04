import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { GeneralSettingsComponent } from "./general-settings.component";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
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
