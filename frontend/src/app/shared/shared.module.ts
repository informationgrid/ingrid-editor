import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatTreeModule} from "@angular/material/tree";
import {AngularSplitModule} from "angular-split";
import {TreeComponent} from '../+form/sidebars/tree/tree.component';
import {TreeHeaderComponent} from '../+form/sidebars/tree/tree-header/tree-header.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FlexModule} from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ReactiveFormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@NgModule({
    imports: [CommonModule, MatIconModule, MatTreeModule, AngularSplitModule.forRoot(), MatButtonModule, MatFormFieldModule, MatProgressBarModule, MatSlideToggleModule, FlexModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, MatProgressSpinnerModule],
  declarations: [TreeComponent, TreeHeaderComponent],
  exports: [TreeComponent, MatIconModule, MatButtonModule]
})
export class SharedModule {
}
