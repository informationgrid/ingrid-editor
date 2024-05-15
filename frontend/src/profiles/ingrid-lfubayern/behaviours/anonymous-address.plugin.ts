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
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AnonymousAddressPlugin extends Plugin {
  id = "plugin.lfubayern.anonymous.address";
  name = "Anonymisierte Adresse";
  description =
    "Die ausgewählte Adresse wird für den Export ins externe System verwendet";
  defaultActive = true;
  group = "Adressen";

  constructor() {
    super();
    this.fields.push({
      key: "uuid",
      type: "input",
      wrappers: ["form-field"],
      modelOptions: {
        updateOn: "blur",
      },
      props: {
        label: "Uuid",
        appearance: "outline",
      },
    });
  }

  register() {
    super.register();
  }
}
