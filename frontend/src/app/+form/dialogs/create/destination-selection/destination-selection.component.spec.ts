import { DestinationSelectionComponent } from "./destination-selection.component";
import { PageTemplateModule } from "../../../../shared/page-template/page-template.module";
import { SharedModule } from "../../../../shared/shared.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { RouterTestingModule } from "@angular/router/testing";
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

describe("DestinationSelectionComponent", () => {
  let spectator: Spectator<DestinationSelectionComponent>;
  let db: SpyObject<DynamicDatabase>;
  let config: SpyObject<ConfigService>;

  const createHost = createComponentFactory({
    component: DestinationSelectionComponent,
    imports: [
      PageTemplateModule,
      SharedModule,
      HttpClientTestingModule,
      MatDialogModule,
      RouterTestingModule,
      MatSnackBarModule,
      getTranslocoModule(),
    ],
    componentMocks: [DynamicDatabase, ConfigService],
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
    config.isAdmin.and.returnValue(true);
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
