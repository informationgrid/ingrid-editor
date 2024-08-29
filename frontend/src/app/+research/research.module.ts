/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ResearchComponent } from "./research.component";
import { routing } from "./research.routing";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import { MatSortModule } from "@angular/material/sort";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { IgePagingIntl } from "../shared/IgePagingIntl";

import { SaveQueryDialogComponent } from "./save-query-dialog/save-query-dialog.component";

import { MatDialogModule } from "@angular/material/dialog";
import { TabSqlComponent } from "./+tab-sql/tab-sql.component";
import { ResultTableComponent } from "./result-table/result-table.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { AddButtonModule } from "../shared/add-button/add-button.module";
import { QueryManagerComponent } from "./+query-manager/query-manager.component";

import { MatChipsModule } from "@angular/material/chips";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DateAdapter } from "@angular/material/core";
import { GermanDateAdapter } from "../services/german-date.adapter";
import { SharedModule } from "../shared/shared.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TabSearchComponent } from "./+tab-search/tab-search.component";
import { TranslocoModule } from "@ngneat/transloco";
import { ResultTableHeaderComponent } from "./result-table/result-table-header/result-table-header.component";

@NgModule({
  imports: [
    CommonModule,
    routing,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatSortModule,
    MatMenuModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule,
    MatListModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonToggleModule,
    AddButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslocoModule,
    ResultTableHeaderComponent,
    ResearchComponent,
    QueryManagerComponent,
    SaveQueryDialogComponent,
    TabSqlComponent,
    ResultTableComponent,
    TabSearchComponent,
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useValue: new IgePagingIntl(),
    },
    {
      provide: DateAdapter,
      useClass: GermanDateAdapter,
    },
  ],
})
export class ResearchModule {}
