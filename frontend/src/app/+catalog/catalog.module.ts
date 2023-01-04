import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { routing } from "./catalog.routing";
import { CatalogService } from "./services/catalog.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { FlexLayoutModule } from "@angular/flex-layout";
import { RouterModule } from "@angular/router";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { CatalogCodelistsComponent } from "./codelists/catalog-codelists.component";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { BehavioursModule } from "./+behaviours/behaviours.module";
import { SharedModule } from "../shared/shared.module";
import { IndexingComponent } from "./indexing/indexing.component";
import { CatalogSettingsComponent } from "./catalog-settings.component";
import { FilterSelectModule } from "../shared/filter-select/filter-select.module";
import { UpdateCodelistComponent } from "./codelists/update-codelist/update-codelist.component";
import { FormFieldsModule } from "../form-fields/form-fields.module";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { CodelistPresenterModule } from "../shared/codelist-presenter/codelist-presenter.module";
import { LogResultComponent } from "./indexing/log-result/log-result.component";
import { MatLegacyProgressBarModule as MatProgressBarModule } from "@angular/material/legacy-progress-bar";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { FormlyModule } from "@ngx-formly/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
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
