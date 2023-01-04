import { createHostFactory, SpectatorHost } from "@ngneat/spectator";

import { RepeatDetailListComponent } from "./repeat-detail-list.component";
import { FormlyFieldConfig, FormlyForm, FormlyModule } from "@ngx-formly/core";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";

describe("RepeatDetailListComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [RepeatDetailListComponent, AddButtonComponent],
    imports: [
      MatDialogModule,
      MatListModule,
      FormlyModule.forRoot({
        types: [
          {
            name: "repeatDetailList",
            component: RepeatDetailListComponent,
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
            key: "repeatField",
            type: "repeatDetailList",
            props: {},
            fieldArray: {
              fieldGroup: [
                {
                  key: "type",
                  type: "input",
                  props: {
                    label: "Typ",
                    appearance: "outline",
                  },
                },
              ],
            },
          },
        ] as FormlyFieldConfig[],
      },
    });
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
