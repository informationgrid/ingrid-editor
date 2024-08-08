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
import { DestinationSelectionComponent } from "./destination-selection.component";
import { PageTemplateModule } from "../../../../shared/page-template/page-template.module";
import { SharedModule } from "../../../../shared/shared.module";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MatDialogModule } from "@angular/material/dialog";
import {
  createComponentFactory,
  Spectator,
  SpyObject,
} from "@ngneat/spectator";
import { DynamicDatabase } from "../../../sidebars/tree/dynamic.database";
import { ConfigService } from "../../../../services/config/config.service";
import { of, Subject } from "rxjs";
import { recentDocuments } from "../../../../_test-data/documents";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { getTranslocoModule } from "../../../../transloco-testing.module";
import { provideLocationMocks } from "@angular/common/testing";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

describe("DestinationSelectionComponent", () => {
  let spectator: Spectator<DestinationSelectionComponent>;
  let db: SpyObject<DynamicDatabase>;
  let config: SpyObject<ConfigService>;

  const createHost = createComponentFactory({
    component: DestinationSelectionComponent,
    imports: [
      PageTemplateModule,
      SharedModule,
      MatDialogModule,
      MatSnackBarModule,
      getTranslocoModule(),
    ],
    componentMocks: [DynamicDatabase, ConfigService],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      provideLocationMocks(),
    ],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
    db = spectator.inject(DynamicDatabase, true);
    db.initialData.and.returnValue(of(recentDocuments));
    db.treeUpdates = new Subject();
    // db.mapDocumentsToTreeNodes.andCallFake(mapDocumentsToTreeNodes);
    // by default return no children when requested (can be overridden)
    db.getChildren.and.returnValue(of([]));
    config = spectator.inject(ConfigService, true);
    config.hasCatAdminRights.and.returnValue(true);
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
