import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SettingsComponent } from "./settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { MatTabsModule } from "@angular/material/tabs";
import { routing } from "./settings.routing";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CodelistsComponent } from "./codelists/codelists.component";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { FilterSelectModule } from "../shared/filter-select/filter-select.module";
import { CatalogManagementComponent } from "./catalog-management/catalog-management.component";
import { CatalogDetailComponent } from "./catalog-management/catalog-detail/catalog-detail.component";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";
import { FormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AddButtonModule } from "../shared/add-button/add-button.module";
import { NewCatalogDialogModule } from "./catalog-management/new-catalog/new-catalog-dialog.module";
import { MatMenuModule } from "@angular/material/menu";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { CodelistPresenterModule } from "../shared/codelist-presenter/codelist-presenter.module";
import { IBusManagementComponent } from "./ibus-management/i-bus-management.component";
import { FormlyModule } from "@ngx-formly/core";
import { IgeFormlyModule } from "../formly/ige-formly.module";
import { MessagesManagementComponent } from "./messages-management/messages-management.component";
import { SharedModule } from "../shared/shared.module";
import { NewMessageDialogComponent } from "./messages-management/new-message-dialog/new-message-dialog.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CatalogAssignmentComponent } from "./catalog-assignment/catalog-assignment.component";
import { ContentManagementComponent } from "./content-management/content-management.component";

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
    ContentManagementComponent,
  ],
})
export class SettingsModule {}
