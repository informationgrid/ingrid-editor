import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { routing } from "./catalog.routing";
import { CatalogService } from "./services/catalog.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { CatalogCodelistsComponent } from "./codelists/catalog-codelists.component";
import { MatSelectModule } from "@angular/material/select";
import { BehavioursModule } from "./+behaviours/behaviours.module";
import { SharedModule } from "../shared/shared.module";
import { IndexingComponent } from "./indexing/indexing.component";
import { CatalogSettingsComponent } from "./catalog-settings.component";
import { FilterSelectModule } from "../shared/filter-select/filter-select.module";
import { UpdateCodelistComponent } from "./codelists/update-codelist/update-codelist.component";
import { FormFieldsModule } from "../form-fields/form-fields.module";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { MatMenuModule } from "@angular/material/menu";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { CodelistPresenterModule } from "../shared/codelist-presenter/codelist-presenter.module";
import { LogResultComponent } from "./indexing/log-result/log-result.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { FormlyModule } from "@ngx-formly/core";
import { JobHandlerHeaderModule } from "../shared/job-handler-header/job-handler-header.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CodelistPresenterModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatInputModule,
    routing,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    BehavioursModule,
    SharedModule,
    FilterSelectModule,
    FormFieldsModule,
    ReactiveFormsModule,
    PageTemplateModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressBarModule,
    DragDropModule,
    FormlyModule,
    JobHandlerHeaderModule,
  ],
  providers: [CatalogService],
  declarations: [
    CatalogSettingsComponent,
    CatalogCodelistsComponent,
    IndexingComponent,
    UpdateCodelistComponent,
    LogResultComponent,
    ConfigurationComponent,
  ],
  exports: [RouterModule],
})
export class CatalogModule {}
