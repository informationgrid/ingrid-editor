import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodelistPresenterComponent} from './codelist-presenter.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule
  ],
  declarations: [CodelistPresenterComponent],
  exports: [CodelistPresenterComponent]
})
export class CodelistPresenterModule {
}
