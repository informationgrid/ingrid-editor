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
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CardBoxComponent} from './card-box/card-box.component';
import {MatCardModule} from '@angular/material/card';
import {EmptyNavigationComponent} from '../+form/sidebars/tree/empty-navigation/empty-navigation.component';
import {SharedDocumentItemModule} from './shared-document-item.module';
import {AddButtonComponent} from './add-button/add-button.component';
import {OptionListComponent} from './option-list/option-list.component';
import {MatRadioModule} from '@angular/material/radio';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
    imports: [
        CommonModule,
        MatTreeModule, AngularSplitModule.forRoot(), MatButtonModule, MatFormFieldModule, MatProgressBarModule,
        MatSlideToggleModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, MatProgressSpinnerModule,
        MatCardModule,
        SharedDocumentItemModule, MatRadioModule, FormsModule, DragDropModule, MatCheckboxModule],
  declarations: [TreeComponent, EmptyNavigationComponent, TreeHeaderComponent, CardBoxComponent, AddButtonComponent,
    OptionListComponent],
  exports: [TreeComponent, MatIconModule, MatInputModule, MatButtonModule, CardBoxComponent, AddButtonComponent,
    OptionListComponent, SharedDocumentItemModule]
})
export class SharedModule {
}
