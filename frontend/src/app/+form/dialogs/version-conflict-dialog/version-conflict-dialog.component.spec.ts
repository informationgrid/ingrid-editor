import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { VersionConflictDialogComponent } from "./version-conflict-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { SharedModule } from "../../../shared/shared.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ConfigService } from "../../../services/config/config.service";

describe("VersionConflictDialogComponent", () => {
  let spectator: Spectator<VersionConflictDialogComponent>;
  let configService;

  const createComponent = createComponentFactory({
    component: VersionConflictDialogComponent,
    imports: [MatDialogModule, SharedModule, HttpClientTestingModule],
  });

  beforeEach(() => {
    configService = TestBed.inject(ConfigService);
  });

  it("should show two options when property not set", () => {
    spyOn(configService, "getConfiguration").and.returnValue({});
    spectator = createComponent();

    expect(spectator.queryAll("mat-radio-button").length).toEqual(2);
  });

  it("should show two options when property set to 'false'", () => {
    spyOn(configService, "getConfiguration").and.returnValue({
      allowOverwriteOnVersionConflict: false,
    });
    spectator = createComponent();

    expect(spectator.queryAll("mat-radio-button").length).toEqual(2);
  });

  it("should show two options when property set to 'true'", () => {
    spyOn(configService, "getConfiguration").and.returnValue({
      allowOverwriteOnVersionConflict: true,
    });
    spectator = createComponent();

    expect(spectator.queryAll("mat-radio-button").length).toEqual(3);
  });
});
