import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicFieldComponent} from './dynamic-field.component';
import {FormToolbarComponent} from './toolbar/form-toolbar.component';
import {FormsModule} from '@angular/forms';
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
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AddPartialDialogComponent} from './partialGenerator/dialog/add-partial-dialog.component';
import {SidebarComponent} from './sidebars/sidebar.component';
import {FormInfoComponent} from './form-info/form-info.component';
import {FormDialogsModule} from '../dialogs/form/form-dialogs.module';
import {FormFieldsModule} from '../form-fields/form-fields.module';
import {AngularSplitModule} from 'angular-split';
import {RouterModule} from '@angular/router';
import {FormlyModule} from '@ngx-formly/core';
import {IgeFormlyModule} from '../formly/ige-formly.module';
import { HeaderNavigationComponent } from './form-info/header-navigation/header-navigation.component';
import { BreadcrumbComponent } from './form-info/breadcrumb/breadcrumb.component';
import { HeaderTitleRowComponent } from './form-info/header-title-row/header-title-row.component';

@NgModule({
  imports: [
    RouterModule.forChild(routing),
    CommonModule,
    AngularSplitModule,
    IgeWizardModule, FormDialogsModule, SharedModule,
    MatFormFieldModule, MatToolbarModule, MatInputModule, MatTableModule,
    MatTabsModule, MatDividerModule, MatListModule, MatDialogModule, MatRadioModule, MatCheckboxModule, MatExpansionModule, MatCardModule,
    FlexLayoutModule,
    FormlyModule,
    IgeFormlyModule,
    FormDialogsModule, FormFieldsModule],
  declarations: [
    FormToolbarComponent, DynamicFieldComponent, PartialGenerator,
    BrowserComponent, LinkDatasetComponent, LeafletComponent, DynamicFormComponent,
    AddPartialDialogComponent,
    // OneColumnWrapperComponent,
    ScrollToDirective, MainFormComponent, MainFormTabsComponent, SidebarComponent, FormInfoComponent, HeaderNavigationComponent, BreadcrumbComponent, HeaderTitleRowComponent],
  providers: [NominatimService],
  exports: [FormsModule, ScrollToDirective, MainFormTabsComponent],
  entryComponents: [AddPartialDialogComponent]
})
export class IgeFormModule {
}
