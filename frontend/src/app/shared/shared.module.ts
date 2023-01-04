import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTreeModule } from "@angular/material/tree";
import { AngularSplitModule } from "angular-split";
import { TreeComponent } from "../+form/sidebars/tree/tree.component";
import { TreeHeaderComponent } from "../+form/sidebars/tree/tree-header/tree-header.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { EmptyNavigationComponent } from "../+form/sidebars/tree/empty-navigation/empty-navigation.component";
import { SharedDocumentItemModule } from "./shared-document-item.module";
import { OptionListComponent } from "./option-list/option-list.component";
import { MatRadioModule } from "@angular/material/radio";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { AddButtonModule } from "./add-button/add-button.module";
import { AddButtonComponent } from "./add-button/add-button.component";
import { CardBoxModule } from "./card-box/card-box.module";
import { CardBoxComponent } from "./card-box/card-box.component";
import { ChartComponent } from "../+dashboard/chart/chart.component";
import { FacetsComponent } from "../+research/+facets/facets.component";
import { SpatialListComponent } from "../formly/types/map/spatial-list/spatial-list.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMenuModule } from "@angular/material/menu";
import { FeatureFlagDirective } from "../directives/feature-flag.directive";
import { DndDirective } from "../directives/dnd.directive";
import { MatSelectModule } from "@angular/material/select";
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
