/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { FormFieldHelper } from "../../../profiles/form-field-helper";
import { inject, Injectable } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import {
  SelectOption,
  SelectOptionUi,
} from "../../services/codelist/codelist.service";
import {
  ConfigService,
  Connections,
} from "../../services/config/config.service";
import { map } from "rxjs/operators";
import { ExchangeService } from "../../+importExport/exchange.service";

@Injectable({ providedIn: "root" })
export class IndexingFields extends FormFieldHelper {
  configService = inject(ConfigService);
  exchangeService = inject(ExchangeService);

  fields: FormlyFieldConfig[] = [
    this.addRepeat("catalog-index-config", "", {
      wrappers: [],
      className: "space-bottom flex-1",
      noDrag: true,
      fields: [
        this.addGroupSimple(
          null,
          [
            this.addSelectInline("target", "Ziel", {
              required: true,
              simple: true,
              useFirstValueInitially: true,
              options: this.configService
                .getIBusConfig()
                .pipe(map((configs) => this.mapConnections(configs))),
            }),
            this.addSelectInline("tags", "Veröffentlichungsrecht", {
              defaultValue: ["internet"],
              required: true,
              multiple: true,
              simple: true,
              options: [
                { value: "internet", label: "Internet" },
                { value: "intranet", label: "Intranet" },
                { value: "amtsintern", label: "amtsintern" },
              ],
            }),
            this.addSelectInline("exporterId", "Exporter", {
              required: true,
              simple: true,
              useFirstValueInitially: true,
              options: this.exchangeService.getExportTypes(false).pipe(
                map((info) => {
                  return info
                    .filter((item) => item.useForPublish)
                    .map((item) => new SelectOption(item.type, item.name));
                }),
              ),
            }),
          ],
          {
            fieldGroupClassName: "flex-row gap-6",
            className: "flex-1",
          },
        ),
      ],
      validators: {
        uniqueTarget: {
          expression: (ctrl, field) => {
            const uniqueTargets = new Set(
              ctrl.value?.map((item) => item.target) ?? [],
            );
            return uniqueTargets.size === ctrl.value.length;
          },
          message: "Jedes Ziel darf nur einmal verwendet werden",
        },
      },
    }),
  ];

  private mapConnections(configs: Connections): SelectOptionUi[] {
    return configs.connections.map((item) => {
      return new SelectOption(item.id.toString(), item.name);
    });
  }
}
