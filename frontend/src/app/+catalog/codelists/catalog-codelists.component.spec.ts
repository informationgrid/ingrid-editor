import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { CatalogCodelistsComponent } from "./catalog-codelists.component";
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { MatDialogModule } from "@angular/material/dialog";
import { CodelistService } from "../../services/codelist/codelist.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";

describe("CodelistsComponent", () => {
  let spectator: Spectator<CatalogCodelistsComponent>;
  const createHost = createComponentFactory({
    component: CatalogCodelistsComponent,
    imports: [MatDialogModule, MatSnackBarModule],
    providers: [mockProvider(CodelistService)],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
