import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicFieldComponent} from './dynamic-field.component';
import {FormToolbarComponent} from './toolbar/form-toolbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DynamicFormComponent} from './dynamic-form.component';
import {LeafletComponent} from './leaflet/leaflet.component';
import {routing} from './ige-form.routing';
import {BrowserComponent} from './sidebars/browser/browser.component';
import {PartialGenerator} from './partialGenerator/partial-generator.component';
import {LinkDatasetComponent} from './linkDataset/link-dataset.component';
import {SharedModule} from '../shared.module';
import {NominatimService} from './leaflet/nominatim.service';
import {MainFormComponent} from './main-form/main-form.component';
import {MainFormTabsComponent} from './main-form-tabs/main-form-tabs.component';
import {IgeWizardModule} from '../wizard/wizard.module';
import {ScrollToDirective} from '../directives/scrollTo.directive';
import {
  MatButtonModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatRadioModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AddPartialDialogComponent} from './partialGenerator/dialog/add-partial-dialog.component';
import { SidebarComponent } from './sidebars/sidebar.component';
import { FormInfoComponent } from './form-info/form-info.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IgeWizardModule, SharedModule,
    MatFormFieldModule, MatToolbarModule, MatIconModule, MatInputModule, MatTableModule, MatDividerModule, MatButtonModule,
    MatTabsModule, MatDividerModule, MatListModule, MatDialogModule, MatRadioModule,
    FlexLayoutModule,
    SharedModule, routing],
  declarations: [
    FormToolbarComponent, DynamicFieldComponent, PartialGenerator,
    BrowserComponent, LinkDatasetComponent, LeafletComponent, DynamicFormComponent, AddPartialDialogComponent,
    ScrollToDirective, MainFormComponent, MainFormTabsComponent, SidebarComponent, FormInfoComponent],
  providers: [NominatimService],
  exports: [FormsModule, ScrollToDirective, MainFormTabsComponent],
  entryComponents: [AddPartialDialogComponent]
})
export class IgeFormModule {
}
