import { createHostFactory, SpectatorHost } from "@ngneat/spectator";

import { RepeatDistributionDetailListComponent } from "./repeat-distribution-detail-list.component";
import { FormlyFieldConfig, FormlyForm, FormlyModule } from "@ngx-formly/core";

describe("RepeatDistributionDetailListComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    imports: [
      RepeatDistributionDetailListComponent,
      FormlyModule.forRoot({
        types: [
          {
            name: "repeatDistributionDetailList",
            component: RepeatDistributionDetailListComponent,
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
            type: "repeatDistributionDetailList",
            props: {
              fields: [
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
