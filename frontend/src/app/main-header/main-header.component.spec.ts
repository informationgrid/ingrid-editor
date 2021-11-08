import { waitForAsync } from "@angular/core/testing";

import { MainHeaderComponent } from "./main-header.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { BreadcrumbComponent } from "../+form/form-info/breadcrumb/breadcrumb.component";
import { ApiService } from "../services/ApiService";
import { ConfigService } from "../services/config/config.service";
import { Router } from "@angular/router";
import { KeycloakService } from "keycloak-angular";

describe("MainHeaderComponent", () => {
  let spectator: Spectator<MainHeaderComponent>;
  const createHost = createComponentFactory({
    component: MainHeaderComponent,
    imports: [MatDialogModule],
    declarations: [BreadcrumbComponent],
    componentMocks: [ApiService, ConfigService, Router, MatDialog],
    mocks: [KeycloakService],
    detectChanges: false,
  });

  beforeEach(
    waitForAsync(() => {
      spectator = createHost();
    })
  );

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
