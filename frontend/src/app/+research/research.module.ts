import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ResearchComponent } from "./research.component";
import { routing } from "./research.routing";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { FlexModule } from "@angular/flex-layout";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatTableExporterModule } from "mat-table-exporter";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import {
  MatLegacyPaginatorIntl as MatPaginatorIntl,
  MatLegacyPaginatorModule as MatPaginatorModule,
} from "@angular/material/legacy-paginator";
import { IgePagingIntl } from "../shared/IgePagingIntl";
import { DocumentIconModule } from "../shared/document-icon/document-icon.module";
import { SaveQueryDialogComponent } from "./save-query-dialog/save-query-dialog.component";
import { FormFieldsModule } from "../form-fields/form-fields.module";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { TabSqlComponent } from "./+tab-sql/tab-sql.component";
import { ResultTableComponent } from "./result-table/result-table.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { AddButtonModule } from "../shared/add-button/add-button.module";
import { QueryManagerComponent } from "./+query-manager/query-manager.component";
import { CardBoxModule } from "../shared/card-box/card-box.module";
import { SharedPipesModule } from "../directives/shared-pipes.module";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DateAdapter } from "@angular/material/core";
import { GermanDateAdapter } from "../services/german-date.adapter";
import { SharedModule } from "../shared/shared.module";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { TabSearchComponent } from "./+tab-search/tab-search.component";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  declarations: [
    ResearchComponent,
    QueryManagerComponent,
    SaveQueryDialogComponent,
    TabSqlComponent,
    ResultTableComponent,
    TabSearchComponent,
  ],
  imports: [
    CommonModule,
    routing,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    MatTableModule,
    FlexModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatSortModule,
    MatMenuModule,
    MatSelectModule,
    MatTableExporterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatListModule,
    MatPaginatorModule,
    DocumentIconModule,
    FormFieldsModule,
    MatDialogModule,
    MatButtonToggleModule,
    AddButtonModule,
    CardBoxModule,
    SharedPipesModule,
    PageTemplateModule,
    MatChipsModule,
    MatDatepickerModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslocoModule,
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
