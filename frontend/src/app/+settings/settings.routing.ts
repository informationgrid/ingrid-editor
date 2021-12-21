import { RouterModule } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { CodelistsComponent } from "./codelists/codelists.component";
import { CatalogManagementComponent } from "./catalog-management/catalog-management.component";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: SettingsComponent,
    children: [
      {
        path: "",
        redirectTo: "general",
      },
      {
        path: "general",
        component: GeneralSettingsComponent,
        data: {
          title: "general",
        },
      },
      {
        path: "codelist",
        component: CodelistsComponent,
        data: {
          title: "codelist",
        },
      },
      {
        path: "catalog",
        component: CatalogManagementComponent,
        data: {
          title: "catalog",
        },
      },
    ],
  },
]);
