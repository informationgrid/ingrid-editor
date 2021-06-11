import { AddressTypeComponent } from "./address-type.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { RouterTestingModule } from "@angular/router/testing";
import { DocumentService } from "../../../services/document/document.service";

describe("AddressTypeComponent", () => {
  let spectator: Spectator<AddressTypeComponent>;
  const createHost = createComponentFactory({
    component: AddressTypeComponent,
    imports: [MatDialogModule, MatTabsModule, RouterTestingModule],
    mocks: [DocumentService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
