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
              options: this.exchangeService.getExportTypes().pipe(
                map((info) => {
                  return info.map(
                    (item) => new SelectOption(item.name, item.type),
                  );
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
