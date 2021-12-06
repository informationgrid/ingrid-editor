import { CatalogSettingsComponent } from "./catalog-settings.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { BehaviorSubject, of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { CatalogQuery } from "../store/catalog/catalog.query";
import { ConfigService, UserInfo } from "../services/config/config.service";
import { CatalogService } from "./services/catalog.service";
import { UserService } from "../services/user/user.service";
import { ActivatedRoute } from "@angular/router";

describe("CatalogManagerComponent", () => {
  let spectator: Spectator<CatalogSettingsComponent>;
  const createHost = createComponentFactory({
    component: CatalogSettingsComponent,
    imports: [
      RouterTestingModule,
      MatDialogModule,
      MatFormFieldModule,
      MatListModule,
    ],
    providers: [
      {
        provide: MatDialogRef,
        useValue: {},
      },
      { provide: MAT_DIALOG_DATA, useValue: [] },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { firstChild: { url: [{ path: "xxx" }] } },
        },
      },
    ],
    componentMocks: [CatalogQuery],
    mocks: [CatalogService, UserService, ConfigService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    spectator.inject(CatalogService).getCatalogs.andReturn(of([]));
    spectator.inject(ConfigService).$userInfo = new BehaviorSubject<UserInfo>(<
      UserInfo
    >{
      assignedCatalogs: [],
      currentCatalog: { id: "xxx" },
      name: "",
      firstName: "",
      lastName: "",
      role: "",
      groups: [],
      userId: "",
      permissions: [],
    });

    spectator.detectChanges();

    expect(spectator.component).toBeTruthy();
  });
});
