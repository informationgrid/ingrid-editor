import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicFieldComponent} from './dynamic-field.component';
import {FormToolbarComponent} from './toolbar/form-toolbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {DynamicFormComponent} from './dynamic-form.component';
import {LeafletComponent} from './leaflet/leaflet.component';
import {routing} from './ige-form.routing';
import {BrowserComponent} from './sidebars/browser/browser.component';
import {ModalModule} from 'ng2-modal';
import {OpenTable} from './opentable/opentable.component';
import {PartialGenerator} from './partialGenerator/partial-generator.component';
// import {TreeModule} from 'angular2-tree-component';
import {TreeModule} from '../_forks/angular2-tree-component/angular2-tree-component';
import {MetadataTreeComponent} from './sidebars/tree/tree.component';
import {LinkDatasetComponent} from './linkDataset/link-dataset.component';
import {FocusDirective} from '../directives/focus.directive';

@NgModule( {
  imports: [CommonModule, FormsModule, ReactiveFormsModule, routing, ModalModule, TreeModule],
  declarations: [FormToolbarComponent, DynamicFieldComponent, OpenTable, PartialGenerator, BrowserComponent, MetadataTreeComponent, LinkDatasetComponent, LeafletComponent, DynamicFormComponent, FocusDirective],
  exports: [FormsModule, FocusDirective]
} )
export class IgeFormModule {
}
