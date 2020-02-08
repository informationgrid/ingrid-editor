import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddressComponent} from './address/address.component';
import {routing} from './address.routing';
import {AngularSplitModule} from 'angular-split';
import {ReactiveFormsModule} from '@angular/forms';
import {FormlyModule} from '@ngx-formly/core';
import {FlexModule} from '@angular/flex-layout';
import {IgeFormModule} from '../+form/ige-form.module';

@NgModule({
  declarations: [AddressComponent],
  imports: [
    CommonModule,
    routing,
    AngularSplitModule,
    ReactiveFormsModule,
    FormlyModule,
    FlexModule,
    IgeFormModule
  ]
})
export class AddressModule {
}
