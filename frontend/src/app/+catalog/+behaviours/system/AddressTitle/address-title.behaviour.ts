/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import {
  AddressTitleFn,
  DocumentService,
} from "../../../../services/document/document.service";
import { IgeDocument } from "../../../../models/ige-document";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable({
  providedIn: "root",
})
export class AddressTitleBehaviour extends Plugin {
  id = "plugin.address.title";
  name = "Template für die Generierung des Adressen-Titels";
  description = `<p>Definition für den Titel, der bei einer neuen Adresse generiert wird.</p>
<p>Beispiele: <ul><li>\${address.firstName ? address.lastName + ", " + address.firstName : address.organization}</li>
<li>\${address.lastName} --- generated</li></ul></p>`;
  group = "Adressen";
  defaultActive = false;

  private addressTitleFunction: AddressTitleFn = (address: IgeDocument) => {
    return this.formatAddressString(address, `\`${this.data.template}\``);
  };

  constructor(private documentService: DocumentService) {
    super();

    this.fields.push({
      key: "template",
      type: "input",
      props: {
        placeholder:
          '${address.firstName ? address.lastName + ", " + address.firstName : address.organization}',
        appearance: "outline",
        required: true,
      },
      modelOptions: {
        updateOn: "blur",
      },
    });

    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();

    this.documentService.registerAddressTitleFunction(
      this.addressTitleFunction,
    );
  }

  unregister() {
    super.unregister();
    this.documentService.registerAddressTitleFunction(null);
  }

  private formatAddressString(obj, formatString) {
    // Wrap formatString into a function body
    const formatterFunction = new Function(
      "address",
      `return ${formatString};`,
    );

    // Safely call the function with the object
    return formatterFunction(obj);
  }
}
