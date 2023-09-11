import { createHostFactory, SpectatorHost } from "@ngneat/spectator";

import { RepeatDetailListComponent } from "./repeat-detail-list.component";
import { FormlyFieldConfig, FormlyForm, FormlyModule } from "@ngx-formly/core";
import { getTranslocoModule } from "../../../transloco-testing.module";

describe("RepeatDetailListComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    imports: [
      RepeatDetailListComponent,
      FormlyModule.forRoot({
        types: [
          {
            name: "repeatDetailList",
            component: RepeatDetailListComponent,
          },
        ],
      }),
      getTranslocoModule(),
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
