import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTreeModule} from '@angular/material/tree';
import {AngularSplitModule} from 'angular-split';
import {TreeComponent} from '../+form/sidebars/tree/tree.component';
import {TreeHeaderComponent} from '../+form/sidebars/tree/tree-header/tree-header.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FlexModule} from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ReactiveFormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CardBoxComponent } from './card-box/card-box.component';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { DocumentListItemComponent } from './document-list-item/document-list-item.component';
import {MatLineModule} from '@angular/material/core';
import {MatListModule} from '@angular/material/list';
import {DateAgoPipe} from "../directives/date-ago.pipe";
import {EmptyNavigationComponent} from "../+form/sidebars/tree/empty-navigation/empty-navigation.component";

@NgModule({
  imports: [
    CommonModule,
    MatIconModule, MatTreeModule, AngularSplitModule.forRoot(), MatButtonModule, MatFormFieldModule, MatProgressBarModule,
    MatSlideToggleModule, FlexModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, MatProgressSpinnerModule,
    MatCardModule, MatDividerModule, MatLineModule, MatListModule],
  declarations: [TreeComponent, EmptyNavigationComponent, TreeHeaderComponent, CardBoxComponent, DocumentListItemComponent, DateAgoPipe],
  exports: [TreeComponent, MatIconModule, MatButtonModule, CardBoxComponent, DocumentListItemComponent]
})
export class SharedModule {
}
