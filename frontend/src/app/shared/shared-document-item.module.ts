import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DocumentListItemComponent} from './document-list-item/document-list-item.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatLineModule} from '@angular/material/core';
import {DocumentIconModule} from './document-icon/document-icon.module';
import {SharedPipesModule} from '../directives/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule, FlexLayoutModule, MatListModule, MatLineModule,
    MatIconModule, MatTooltipModule, MatDividerModule, DocumentIconModule,
    SharedPipesModule
  ],
  declarations: [DocumentListItemComponent],
  exports: [
    DocumentListItemComponent, FlexLayoutModule, MatListModule, MatLineModule,
    MatIconModule, MatTooltipModule, MatDividerModule
  ]
})
export class SharedDocumentItemModule {
}
