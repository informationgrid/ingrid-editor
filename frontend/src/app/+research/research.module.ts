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
import {FacetsComponent} from './research/facets/facets.component';
import {QueryManagerComponent} from './research/query-manager/query-manager.component';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {IgePagingIntl} from '../shared/IgePagingIntl';
import {DocumentIconModule} from '../shared/document-icon/document-icon.module';


@NgModule({
  declarations: [ResearchComponent, FacetsComponent, QueryManagerComponent],
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
    ReactiveFormsModule,
    MatIconModule,
    MatListModule,
    MatPaginatorModule,
    DocumentIconModule
  ],
  providers: [{
    provide: MatPaginatorIntl, useValue: new IgePagingIntl()
  }]
})
export class ResearchModule {
}
