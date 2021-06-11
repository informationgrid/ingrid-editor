import {
  createComponentFactory,
  createHostFactory,
  Spectator,
  SpectatorHost,
} from "@ngneat/spectator";

import { DateRangeTypeComponent } from "./date-range-type.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { FormlyFieldConfig, FormlyForm, FormlyModule } from "@ngx-formly/core";
import { RepeatDetailListComponent } from "../repeat-detail-list/repeat-detail-list.component";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormFieldsModule } from "../../../form-fields/form-fields.module";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { RepeatListComponent } from "../repeat-list/repeat-list.component";

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
            templateOptions: {},
          },
        ] as FormlyFieldConfig[],
      },
    });
  });
  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
