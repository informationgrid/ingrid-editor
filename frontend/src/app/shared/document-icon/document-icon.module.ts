import {NgModule} from '@angular/core';
import {DocumentIconComponent} from './document-icon.component';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    MatIconModule,
    CommonModule
  ],
  declarations: [DocumentIconComponent],
  exports: [DocumentIconComponent]
})
export class DocumentIconModule {
}
