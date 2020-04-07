import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddressComponent} from './address/address.component';
import {routing} from './address.routing';
import {AngularSplitModule} from 'angular-split';
import {ReactiveFormsModule} from '@angular/forms';
import {FormlyModule} from '@ngx-formly/core';
import {FlexModule} from '@angular/flex-layout';
import {SharedModule} from '../shared/shared.module';
import {FormSharedModule} from '../+form/form-shared/form-shared.module';
import { AddressDashboardComponent } from './address-dashboard/address-dashboard.component';

@NgModule({
  declarations: [AddressComponent, AddressDashboardComponent],
  imports: [
    routing,
    CommonModule,
    AngularSplitModule,
    ReactiveFormsModule,
    FormlyModule,
    FlexModule,
    SharedModule,
    FormSharedModule
  ],
  providers: []
})
export class AddressModule {
}
