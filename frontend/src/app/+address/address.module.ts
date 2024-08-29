/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
  imports: [
    routing,
    CommonModule,
    AngularSplitModule,
    ReactiveFormsModule,
    FormlyModule,
    SharedModule,
    FormSharedModule,
    AddressComponent,
  ],
  providers: [],
})
export class AddressModule {}
