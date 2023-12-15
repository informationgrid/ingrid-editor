/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";

export class UvpNumberBehaviour extends Plugin {
  id = "plugin.uvp.eia-number";
  name = "UVP Nummer (Codelist-Kategorie)";
  description =
    "Auswahl der Codeliste für die Anzeige der UVP-Nummern. Bitte nach Änderung der Option die Seite neu laden.";
  defaultActive = true;
  group = "UVP";

  constructor() {
    super();

    this.fields.push({
      key: "uvpCodelist",
      type: "ige-select",
      defaultValue: "9000",
      props: {
        showSearch: true,
        appearance: "outline",
        simple: true,
        options: <SelectOptionUi[]>[
          {
            label: "Default (9000)",
            value: "9000",
          },
        ].concat(
          [
            {
              label: "Hamburg (9001)",
              value: "9001",
            },
            {
              label: "Rheinland-Pfalz (9002)",
              value: "9002",
            },
            {
              label: "Sachsen (9003)",
              value: "9003",
            },
            {
              label: "Mecklenburg-Vorpommern (9004)",
              value: "9004",
            },
            {
              label: "Sachsen-Anhalt (9005)",
              value: "9005",
            },
            {
              label: "Schleswig-Holstein (9006)",
              value: "9006",
            },
            {
              label: "Brandenburg (9007)",
              value: "9007",
            },
            {
              label: "Hessen (9008)",
              value: "9008",
            },
            {
              label: "Thüringen (9009)",
              value: "9009",
            },
            {
              label: "Saarland (9010)",
              value: "9010",
            },
            {
              label: "Berlin (9011)",
              value: "9011",
            },
            {
              label: "Bremen (9012)",
              value: "9012",
            },
            {
              label: "Niedersachsen (9013)",
              value: "9013",
            },
            {
              label: "Baden-Württemberg (9014)",
              value: "9014",
            },
            {
              label: "Nordrhein-Westfalen (9015)",
              value: "9015",
            },
            {
              label: "Bayern (9016)",
              value: "9016",
            },
          ].sort((a, b) => a.label?.localeCompare(b.label)),
        ),
      },
    });
  }
}
