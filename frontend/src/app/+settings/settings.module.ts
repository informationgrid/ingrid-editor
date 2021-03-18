import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import {MatTabsModule} from '@angular/material/tabs';
import {routing} from './settings.routing';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FlexModule} from '@angular/flex-layout';
import {CodelistsComponent} from './codelists/codelists.component';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';



@NgModule({
  declarations: [SettingsComponent, GeneralSettingsComponent, CodelistsComponent],
  imports: [
    CommonModule, MatTabsModule,
    routing, MatCheckboxModule, MatFormFieldModule, MatInputModule, FlexModule, MatCardModule, MatSelectModule, MatButtonModule, MatTableModule, MatSortModule
  ]
})
export class SettingsModule { }
