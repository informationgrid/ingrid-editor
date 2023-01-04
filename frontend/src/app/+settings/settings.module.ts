import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SettingsComponent } from "./settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { routing } from "./settings.routing";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { FlexModule } from "@angular/flex-layout";
import { CodelistsComponent } from "./codelists/codelists.component";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatSortModule } from "@angular/material/sort";
import { FilterSelectModule } from "../shared/filter-select/filter-select.module";
import { CatalogManagementComponent } from "./catalog-management/catalog-management.component";
import { CatalogDetailComponent } from "./catalog-management/catalog-detail/catalog-detail.component";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { FormsModule } from "@angular/forms";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { AddButtonModule } from "../shared/add-button/add-button.module";
import { NewCatalogDialogModule } from "./catalog-management/new-catalog/new-catalog-dialog.module";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { CodelistPresenterModule } from "../shared/codelist-presenter/codelist-presenter.module";
import { IBusManagementComponent } from "./ibus-management/i-bus-management.component";
import { FormlyModule } from "@ngx-formly/core";
import { IgeFormlyModule } from "../formly/ige-formly.module";
import { MessagesManagementComponent } from "./messages-management/messages-management.component";
import { SharedModule } from "../shared/shared.module";
import { NewMessageDialogComponent } from "./messages-management/new-message-dialog/new-message-dialog.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CatalogAssignmentComponent } from "./catalog-assignment/catalog-assignment.component";
@NgModule({
  declarations: [
    SettingsComponent,
    GeneralSettingsComponent,
    CodelistsComponent,
    CatalogManagementComponent,
    CatalogAssignmentComponent,
    CatalogDetailComponent,
    IBusManagementComponent,
    MessagesManagementComponent,
    NewMessageDialogComponent,
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    routing,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    FlexModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    FilterSelectModule,
    MatIconModule,
    MatDialogModule,
    MatListModule,
    FormsModule,
    MatProgressSpinnerModule,
    AddButtonModule,
    NewCatalogDialogModule,
    MatMenuModule,
    PageTemplateModule,
    CodelistPresenterModule,
    FormlyModule,
    IgeFormlyModule,
    SharedModule,
    MatDatepickerModule,
    DragDropModule,
  ],
})
export class SettingsModule {}
