import { RouterModule } from "@angular/router";
import { ResearchComponent } from "./research.component";
import { TabSqlComponent } from "./+tab-sql/tab-sql.component";
import { QueryManagerComponent } from "./+query-manager/query-manager.component";
import { TabSearchComponent } from "./+tab-search/tab-search.component";
import { TabGuard } from "../shared/tab.guard";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: ResearchComponent,
    children: [
      {
        path: "",
        redirectTo: "search",
      },
      {
        path: "search",
        component: TabSearchComponent,
        canActivate: [TabGuard],
        data: {
          title: "Erweiterte Suche",
          tabIdentifier: "research",
        },
      },
      {
        path: "sql",
        component: TabSqlComponent,
        data: {
          title: "SQL Suche",
        },
      },
      {
        path: "queries",
        component: QueryManagerComponent,
        data: {
          title: "Gespeicherte Suchen",
        },
      },
    ],
  },
]);
