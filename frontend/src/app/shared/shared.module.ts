import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyProgressBarModule as MatProgressBarModule } from "@angular/material/legacy-progress-bar";
import { MatTreeModule } from "@angular/material/tree";
import { AngularSplitModule } from "angular-split";
import { TreeComponent } from "../+form/sidebars/tree/tree.component";
import { TreeHeaderComponent } from "../+form/sidebars/tree/tree-header/tree-header.component";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { EmptyNavigationComponent } from "../+form/sidebars/tree/empty-navigation/empty-navigation.component";
import { SharedDocumentItemModule } from "./shared-document-item.module";
import { OptionListComponent } from "./option-list/option-list.component";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { AddButtonModule } from "./add-button/add-button.module";
import { AddButtonComponent } from "./add-button/add-button.component";
import { CardBoxModule } from "./card-box/card-box.module";
import { CardBoxComponent } from "./card-box/card-box.component";
import { ChartComponent } from "../+dashboard/chart/chart.component";
import { FacetsComponent } from "../+research/+facets/facets.component";
import { SpatialListComponent } from "../formly/types/map/spatial-list/spatial-list.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { FeatureFlagDirective } from "../directives/feature-flag.directive";
import { DndDirective } from "../directives/dnd.directive";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  imports: [
    CommonModule,
    MatTreeModule,
    AngularSplitModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    SharedDocumentItemModule,
    MatRadioModule,
    FormsModule,
    DragDropModule,
    MatCheckboxModule,
    AddButtonModule,
    CardBoxModule,
    MatDatepickerModule,
    MatMenuModule,
    MatSelectModule,
    TranslocoModule,
  ],
  declarations: [
    TreeComponent,
    EmptyNavigationComponent,
    TreeHeaderComponent,
    OptionListComponent,
    ChartComponent,
    FacetsComponent,
    SpatialListComponent,
    FeatureFlagDirective,
    DndDirective,
  ],
  exports: [
    TreeComponent,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    CardBoxComponent,
    OptionListComponent,
    SharedDocumentItemModule,
    AddButtonComponent,
    ChartComponent,
    FacetsComponent,
    SpatialListComponent,
    FeatureFlagDirective,
    DndDirective,
  ],
})
export class SharedModule {}
