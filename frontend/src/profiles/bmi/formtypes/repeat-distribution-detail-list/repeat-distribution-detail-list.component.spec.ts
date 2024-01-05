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
