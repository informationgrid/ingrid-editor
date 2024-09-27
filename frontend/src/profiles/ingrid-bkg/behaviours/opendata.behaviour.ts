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
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class OpendataBehaviour extends Plugin {
  id = "plugin.bkg.opendata";
  name = "OpenData";
  description =
    "Dieses Verhalten ändert das Standardverhalten von OpenData:<ul><li>OpenData-Kategorien werden nicht angezeigt</li><li>Angabe eines Verweises vom Typ 'Download' optional</li></ul>";
  defaultActive = true;
  group = "BKG";

  constructor() {
    super();

    this.fields.push({
      key: "showOpenDataCategories",
      type: "checkbox",
      wrappers: [],
      props: {
        label: "OpenData Kategorien anzeigen",
      },
    });
  }
}
