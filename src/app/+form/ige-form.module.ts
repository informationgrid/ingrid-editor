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
import { PartialGenerator } from './partialGenerator/partial-generator.component';
import { LinkDatasetComponent } from './linkDataset/link-dataset.component';
import { SharedModule } from '../shared.module';
import { CodelistService } from './services/codelist.service';
import { NominatimService } from './leaflet/nominatim.service';
import { MainFormComponent } from './main-form/main-form.component';
import { MainFormTabsComponent } from './main-form-tabs/main-form-tabs.component';
import { IgeWizardModule } from '../wizard/wizard.module';
import { ScrollToDirective } from '../directives/scrollTo.directive';
import { FileUploadModule } from 'ng2-file-upload'
import { PopoverModule } from 'ngx-bootstrap';
import {
  ButtonModule, GrowlModule, MenubarModule,
  ToolbarModule
} from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, ToastyModule.forRoot(), FileUploadModule,
    PopoverModule, IgeWizardModule, SharedModule,
    MenubarModule, ToolbarModule, ButtonModule, GrowlModule,
    SharedModule, routing],
  declarations: [
    FormToolbarComponent, DynamicFieldComponent, PartialGenerator,
    BrowserComponent, LinkDatasetComponent, LeafletComponent, DynamicFormComponent,
    ScrollToDirective, MainFormComponent, MainFormTabsComponent],
  providers: [CodelistService, NominatimService],
  exports: [ToastyModule, FormsModule, ScrollToDirective, MainFormTabsComponent]
})
export class IgeFormModule {
}
