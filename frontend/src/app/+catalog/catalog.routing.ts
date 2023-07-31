import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { CatalogSettingsComponent } from "./catalog-settings.component";
import { CatalogCodelistsComponent } from "./codelists/catalog-codelists.component";
import { IndexingComponent } from "./indexing/indexing.component";
import { BehavioursComponent } from "./+behaviours/behaviours.component";
import { ConfigurationComponent } from "./configuration/configuration.component";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: CatalogSettingsComponent,
    canActivate: [AuthGuard],
    // canDeactivate: [BehavioursChangedGuard],
    data: { roles: ["admin"] },
    children: [
      {
        path: "",
        redirectTo: "codelists",
        pathMatch: "full",
      },
      {
        path: "codelists",
        component: CatalogCodelistsComponent,
        data: {
          title: "codelists",
        },
      },
      {
        path: "form-behaviours",
        component: BehavioursComponent,
        data: {
          title: "form-behaviour",
        },
      },
      {
        path: "indexing",
        component: IndexingComponent,
        data: {
          title: "indexing",
        },
      },
      {
        path: "config",
        component: ConfigurationComponent,
        data: {
          title: "Konfiguration",
        },
      },
    ],
  },
]);
