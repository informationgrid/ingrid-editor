/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { PermissionsComponent } from "./permissions.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator/vitest";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { getTranslocoModule } from "../../transloco-testing.module";
import { provideZonelessChangeDetection } from "@angular/core";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("PermissionsComponent", () => {
  let spectator: Spectator<PermissionsComponent>;
  const createHost = createComponentFactory({
    component: PermissionsComponent,
    imports: [MatDialogModule, ReactiveFormsModule, getTranslocoModule()],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      provideZonelessChangeDetection(),
      { provide: MAT_DIALOG_DATA, useValue: [] },
    ],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });

  it.skip("should display activated permissions", () => {});

  it.skip("should output permissions as JSON", () => {});
});
