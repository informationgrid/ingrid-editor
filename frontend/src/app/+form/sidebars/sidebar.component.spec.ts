import { SidebarComponent } from "./sidebar.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { Router } from "@angular/router";
import { MatDialogModule } from "@angular/material/dialog";
import { DocumentService } from "../../services/document/document.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SharedModule } from "../../shared/shared.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { DynamicDatabase } from "./tree/dynamic.database";
import { ConfigService } from "../../services/config/config.service";

describe("SidebarComponent", () => {
  let spectator: Spectator<SidebarComponent>;
  const createHost = createComponentFactory({
    component: SidebarComponent,
    imports: [
      MatDialogModule,
      MatProgressSpinnerModule,
      SharedModule,
      HttpClientTestingModule,
      MatDialogModule,
      RouterTestingModule,
    ],
    componentMocks: [DynamicDatabase, ConfigService],
    mocks: [Router, DocumentService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
