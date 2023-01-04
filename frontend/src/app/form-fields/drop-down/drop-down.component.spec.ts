import { DropDownComponent } from "./drop-down.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { DocumentService } from "../../services/document/document.service";
import { Router } from "@angular/router";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";

describe("DropDownComponent", () => {
  let spectator: Spectator<DropDownComponent>;
  const createComponent = createComponentFactory({
    component: DropDownComponent,
    imports: [MatFormFieldModule, MatSelectModule],
    mocks: [DocumentService, Router],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
