import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddButtonComponent} from './add-button.component';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [CommonModule, MatIconModule, MatFormFieldModule, MatButtonModule],
  declarations: [AddButtonComponent],
  exports: [AddButtonComponent]
})
export class AddButtonModule {
}
