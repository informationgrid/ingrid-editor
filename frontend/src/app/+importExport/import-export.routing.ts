import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { OverviewComponent } from "./overview.component";
import { ImportComponent } from "./import/import.component";
import { ExportComponent } from "./export/export.component";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: OverviewComponent,
    children: [
      {
        path: "",
        redirectTo: "import",
        pathMatch: "full",
      },
      {
        path: "import",
        component: ImportComponent,
        canActivate: [AuthGuard],
        data: {
          permission: ["can_import"],
          title: "Import",
        },
      },
      {
        path: "export",
        component: ExportComponent,
        canActivate: [AuthGuard],
        data: {
          permission: ["can_export"],
          title: "Export",
        },
      },
    ],
  },
]);
