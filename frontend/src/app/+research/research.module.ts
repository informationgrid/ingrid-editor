import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResearchComponent} from './research/research.component';
import {routing} from './research.routing';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {FlexModule} from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {MatSortModule} from '@angular/material/sort';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatTableExporterModule} from 'mat-table-exporter';


@NgModule({
  declarations: [ResearchComponent],
    imports: [
        CommonModule,
        routing,
        MatCheckboxModule,
        MatRadioModule,
        FormsModule,
        MatTableModule,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatButtonModule,
        MatSortModule,
        MatMenuModule,
        MatSelectModule,
        MatTableExporterModule,
        ReactiveFormsModule
    ]
})
export class ResearchModule {
}
