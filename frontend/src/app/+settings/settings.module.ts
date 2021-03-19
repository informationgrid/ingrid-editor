import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsComponent} from './settings.component';
import {GeneralSettingsComponent} from './general-settings/general-settings.component';
import {MatTabsModule} from '@angular/material/tabs';
import {routing} from './settings.routing';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FlexModule} from '@angular/flex-layout';
import {CodelistsComponent} from './codelists/codelists.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {FilterSelectModule} from '../shared/filter-select/filter-select.module';
import {CatalogManagementComponent} from './catalog-management/catalog-management.component';
import {AddUserDialogComponent} from './catalog-management/catalog-detail/add-user-dialog/add-user-dialog.component';
import {CatalogDetailComponent} from './catalog-management/catalog-detail/catalog-detail.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AddButtonModule} from '../shared/add-button/add-button.module';
import {NewCatalogDialogModule} from './catalog-management/new-catalog/new-catalog-dialog.module';
import {MatMenuModule} from '@angular/material/menu';


@NgModule({
  declarations: [SettingsComponent, GeneralSettingsComponent, CodelistsComponent,
    CatalogManagementComponent,
    CatalogDetailComponent,
    AddUserDialogComponent],
  imports: [
    CommonModule, MatTabsModule,
    routing, MatCheckboxModule, MatFormFieldModule, MatInputModule, FlexModule, MatCardModule, MatButtonModule, MatTableModule, MatSortModule,
    FilterSelectModule, MatIconModule, MatDialogModule, MatListModule, FormsModule, MatProgressSpinnerModule, AddButtonModule,
    NewCatalogDialogModule, MatMenuModule
  ]
})
export class SettingsModule {
}
