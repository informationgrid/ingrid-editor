import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddressComponent } from "./address/address.component";
import { routing } from "./address.routing";
import { AngularSplitModule } from "angular-split";
import { ReactiveFormsModule } from "@angular/forms";
import { FormlyModule } from "@ngx-formly/core";
import { SharedModule } from "../shared/shared.module";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";

@NgModule({
  declarations: [AddressComponent],
  imports: [
    routing,
    CommonModule,
    AngularSplitModule,
    ReactiveFormsModule,
    FormlyModule,
    SharedModule,
    FormSharedModule,
  ],
  providers: [],
})
export class AddressModule {}
