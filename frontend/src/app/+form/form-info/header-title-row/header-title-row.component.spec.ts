import { HeaderTitleRowComponent } from "./header-title-row.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { ProfileService } from "../../../services/profile.service";
import { MatTabsModule } from "@angular/material/tabs";
import { MatRadioModule } from "@angular/material/radio";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { TextFieldModule } from "@angular/cdk/text-field";
import { FormSharedModule } from "../../form-shared/form-shared.module";

describe("HeaderTitleRowComponent", () => {
  let spectator: Spectator<HeaderTitleRowComponent>;
  const createHost = createComponentFactory({
    component: HeaderTitleRowComponent,
    imports: [
      MatTabsModule,
      MatRadioModule,
      MatFormFieldModule,
      MatDatepickerModule,
      TextFieldModule,
      FormSharedModule,
    ],
    mocks: [ProfileService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
