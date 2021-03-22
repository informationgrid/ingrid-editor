import {NgModule} from '@angular/core';
import {DocumentIconComponent} from './document-icon.component';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {MatListModule} from '@angular/material/list';

@NgModule({
  imports: [
    MatIconModule,
    CommonModule,
    MatListModule
  ],
  declarations: [DocumentIconComponent],
  exports: [DocumentIconComponent]
})
export class DocumentIconModule {
}
