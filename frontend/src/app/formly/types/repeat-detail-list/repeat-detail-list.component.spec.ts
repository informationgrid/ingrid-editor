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
            props: {
              fields: [
                {
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
