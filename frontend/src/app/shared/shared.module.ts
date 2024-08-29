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

import { MatRadioModule } from "@angular/material/radio";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { AddButtonModule } from "./add-button/add-button.module";
import { AddButtonComponent } from "./add-button/add-button.component";

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
import { SearchInputComponent } from "./search-input/search-input.component";

import { FullNamePipe } from "../directives/full-name.pipe";
import { A11yModule } from "@angular/cdk/a11y";

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
    MatRadioModule,
    FormsModule,
    DragDropModule,
    MatCheckboxModule,
    AddButtonModule,
    MatDatepickerModule,
    MatMenuModule,
    MatSelectModule,
    TranslocoModule,
    SearchInputComponent,
    A11yModule,
    TreeComponent,
    EmptyNavigationComponent,
    TreeHeaderComponent,
    ChartComponent,
    FacetsComponent,
    SpatialListComponent,
    FeatureFlagDirective,
    DndDirective,
    FullNamePipe,
  ],
  exports: [
    TreeComponent,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    CardBoxComponent,
    AddButtonComponent,
    ChartComponent,
    FacetsComponent,
    SpatialListComponent,
    FeatureFlagDirective,
    DndDirective,
    SearchInputComponent,
    FullNamePipe,
  ],
})
export class SharedModule {}
