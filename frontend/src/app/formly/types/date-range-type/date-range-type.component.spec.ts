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
