import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DateAgoPipe} from '../directives/date-ago.pipe';
import {DocumentListItemComponent} from './document-list-item/document-list-item.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDivider, MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatLineModule} from '@angular/material/core';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, MatListModule, MatLineModule, MatIconModule, MatTooltipModule, MatDividerModule],
  declarations: [DocumentListItemComponent, DateAgoPipe],
  exports: [DocumentListItemComponent, MatDivider, MatIconModule, FlexLayoutModule]
})
export class SharedDocumentItemModule {
}
