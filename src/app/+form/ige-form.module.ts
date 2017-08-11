import { ToastyModule } from 'ng2-toasty';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFieldComponent } from './dynamic-field.component';
import { FormToolbarComponent } from './toolbar/form-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from './dynamic-form.component';
import { LeafletComponent } from './leaflet/leaflet.component';
import { routing } from './ige-form.routing';
import { BrowserComponent } from './sidebars/browser/browser.component';
import { ModalModule } from 'ngx-modal';
import { OpenTable } from './opentable/opentable.component';
import { PartialGenerator } from './partialGenerator/partial-generator.component';
import { TreeModule } from 'angular-tree-component';
import { LinkDatasetComponent } from './linkDataset/link-dataset.component';
import { FocusDirective } from '../directives/focus.directive';
import { SharedModule } from '../shared.module';
import { CodelistService } from './services/codelist.service';
import { NominatimService } from './leaflet/nominatim.service';
import { MainFormComponent } from './main-form/main-form.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import {MainFormTabsComponent} from './main-form-tabs/main-form-tabs.component';
import { SelectRenderComponent } from './opentable/renderComponents/select.render.component';
import { OpentableModule } from './opentable/opentable.module';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, ToastyModule.forRoot(), Ng2SmartTableModule,
    SharedModule, routing, ModalModule, TreeModule, OpentableModule],
  declarations: [
    FormToolbarComponent, DynamicFieldComponent, OpenTable, PartialGenerator,
    BrowserComponent, LinkDatasetComponent, LeafletComponent, DynamicFormComponent,
    FocusDirective, MainFormComponent, MainFormTabsComponent],
  providers: [CodelistService, NominatimService],
  exports: [ToastyModule, FormsModule, FocusDirective]
})
export class IgeFormModule {
}
