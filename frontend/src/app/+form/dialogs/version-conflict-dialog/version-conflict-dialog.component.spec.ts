/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { VersionConflictDialogComponent } from "./version-conflict-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { SharedModule } from "../../../shared/shared.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import {
  ConfigService,
  Configuration,
} from "../../../services/config/config.service";

describe("VersionConflictDialogComponent", () => {
  let spectator: Spectator<VersionConflictDialogComponent>;
  let configService: ConfigService;
  // @ts-ignore
  const defaultConfig: Configuration = {};

  const createComponent = createComponentFactory({
    component: VersionConflictDialogComponent,
    imports: [MatDialogModule, SharedModule, HttpClientTestingModule],
  });

  beforeEach(() => {
    configService = TestBed.inject(ConfigService);
  });

  it("should show two options when property not set", () => {
    spyOn(configService, "getConfiguration").and.returnValue({
      ...defaultConfig,
    });
    spectator = createComponent();

    expect(spectator.queryAll("mat-radio-button").length).toEqual(2);
  });

  it("should show two options when property set to 'false'", () => {
    spyOn(configService, "getConfiguration").and.returnValue({
      ...defaultConfig,
      allowOverwriteOnVersionConflict: false,
    });
    spectator = createComponent();

    expect(spectator.queryAll("mat-radio-button").length).toEqual(2);
  });

  it("should show two options when property set to 'true'", () => {
    spyOn(configService, "getConfiguration").and.returnValue({
      ...defaultConfig,
      allowOverwriteOnVersionConflict: true,
    });
    spectator = createComponent();

    expect(spectator.queryAll("mat-radio-button").length).toEqual(3);
  });
});
