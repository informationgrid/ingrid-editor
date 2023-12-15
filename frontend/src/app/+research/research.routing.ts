/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
        pathMatch: "full",
      },
      {
        path: "search",
        component: TabSearchComponent,
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
