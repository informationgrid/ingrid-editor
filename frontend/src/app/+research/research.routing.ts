import { RouterModule } from "@angular/router";
import { ResearchComponent } from "./research.component";
import { TabSqlComponent } from "./+tab-sql/tab-sql.component";
import { QueryManagerComponent } from "./+query-manager/query-manager.component";
import { TabSearchComponent } from "./+tab-search/tab-search.component";

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
        data: {
          title: "search",
        },
      },
      {
        path: "sql",
        component: TabSqlComponent,
        data: {
          title: "sql",
        },
      },
      {
        path: "queries",
        component: QueryManagerComponent,
        data: {
          title: "sql",
        },
      },
    ],
  },
]);
