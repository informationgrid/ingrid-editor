import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddressComponent} from './address/address.component';
import {routing} from './address.routing';
import {AngularSplitModule} from 'angular-split';
import {ReactiveFormsModule} from '@angular/forms';
import {FormlyModule} from '@ngx-formly/core';
import {FlexModule} from '@angular/flex-layout';
import {FormCoreModule} from '../+form/form-core/form-core.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [AddressComponent],
  imports: [
    routing,
    CommonModule,
    AngularSplitModule,
    ReactiveFormsModule,
    FormlyModule,
    FlexModule,
    FormCoreModule,
    SharedModule
  ]
})
export class AddressModule {
}
