import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DynamicFormComponent} from './dynamic-form.component';
import {LeafletComponent} from './leaflet/leaflet.component';
import {routing} from './ige-form.routing';
import {SharedModule} from '../shared/shared.module';
import {NominatimService} from './leaflet/nominatim.service';
import {IgeWizardModule} from '../wizard/wizard.module';
import {ScrollToDirective} from '../directives/scrollTo.directive';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {SidebarComponent} from './sidebars/sidebar.component';
import {FormDialogsModule} from './dialogs/tree-select/form-dialogs.module';
import {FormFieldsModule} from '../form-fields/form-fields.module';
import {AngularSplitModule} from 'angular-split';
import {RouterModule} from '@angular/router';
import {FormlyModule} from '@ngx-formly/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {NewDocumentComponent} from './dialogs/new-document/new-document.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {PasteDialogComponent} from './dialogs/copy-cut-paste/paste-dialog.component';
import {IsoViewComponent} from './dialogs/isoView/iso-view.component';
import {FormDashboardComponent} from './form-dashboard/form-dashboard.component';
import {PrintViewDialogComponent} from './dialogs/print-view/print-view-dialog.component';
import {FormSharedModule} from './form-shared/form-shared.module';

@NgModule({
  imports: [
    RouterModule.forChild(routing),
    CommonModule,
    AngularSplitModule,
    IgeWizardModule, FormDialogsModule, SharedModule,
    MatFormFieldModule, MatInputModule, MatTableModule, MatMenuModule, MatButtonToggleModule, MatSlideToggleModule,
    MatTabsModule, MatListModule, MatDialogModule, MatRadioModule, MatCheckboxModule, MatExpansionModule, MatCardModule,
    FormlyModule,
    FormFieldsModule,
    FormSharedModule
  ],
  declarations: [
    LeafletComponent, DynamicFormComponent,
    NewDocumentComponent, PasteDialogComponent, IsoViewComponent, PrintViewDialogComponent,
    // OneColumnWrapperComponent,
    ScrollToDirective, SidebarComponent,
    FormDashboardComponent
  ],
  providers: [
    NominatimService],
  exports: [RouterModule, FormsModule, ScrollToDirective, SidebarComponent],
  entryComponents: [NewDocumentComponent, PasteDialogComponent, IsoViewComponent, PrintViewDialogComponent]
})
export class IgeFormModule {
}
