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
import { createHostFactory, SpectatorHost } from "@ngneat/spectator";

import { DateRangeTypeComponent } from "./date-range-type.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormlyFieldConfig, FormlyForm, FormlyModule } from "@ngx-formly/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormFieldsModule } from "../../../form-fields/form-fields.module";
import { FormlyMaterialModule } from "@ngx-formly/material";

describe("DateRangeTypeComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [],
    imports: [
      MatDatepickerModule,
      MatFormFieldModule,
      FormFieldsModule,
      ReactiveFormsModule,
      FormlyMaterialModule,
      FormsModule,
      FormlyModule.forRoot({
        types: [
          {
            name: "dateRange",
            component: DateRangeTypeComponent,
          },
        ],
      }),
    ],
  });

  beforeEach(() => {
    spectator = createHost(`<formly-form [fields]="config"></formly-form>`, {
      hostProps: {
        config: [
          {
            key: "dateRange",
            type: "dateRange",
            props: {},
            /*fieldGroup: [
              { type: "input", key: "start" },
              { type: "input", key: "end" },
            ],*/
          },
        ] as FormlyFieldConfig[],
      },
    });
  });
  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
