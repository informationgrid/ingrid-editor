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
  description =
    'Definition für den Titel, der bei einer neuen Adresse generiert wird. Z.B.: firstName ? lastName + ", " + firstName : organization<br>Verfügbare Felder sind: <b>firstName</b> und ' +
    "<b>lastName</b> für Personen und <b>organization</b> für Organisationen";
  group = "Adressen";
  defaultActive = false;

  private addressTitleFunction: AddressTitleFn = (
    address: IgeDocument /* IMPORTANT FOR EVALUATION! */,
  ) => {
    const value = this.replaceVariables(this.data.template);
    // tslint:disable-next-line:no-eval
    return eval(value) ?? "";
  };

  constructor(private documentService: DocumentService) {
    super();

    this.fields.push({
      key: "template",
      type: "input",
      props: {
        placeholder: 'firstName ? lastName + ", " + firstName : organization',
        appearance: "outline",
        required: true,
      },
      modelOptions: {
        updateOn: "blur",
      },
      validators: {
        template: {
          expression: this.validateInputString(),
          message: () => "Der Wert ist ungültig",
        },
      },
    });

    inject(PluginService).registerPlugin(this);
  }

  private validateInputString() {
    return (c) => {
      let error = false;
      const address = {
        firstName: "",
        lastName: "",
        organization: "",
      }; /* IMPORTANT FOR EVALUATION! */
      try {
        const value = this.replaceVariables(c.value);

        // tslint:disable-next-line:no-eval
        const testString = eval(value);
        console.log("Eval string value: ", value);
        console.log("Eval string evaluated: ", testString);
        if (testString && typeof testString !== "string") {
          throw new Error("Not a String");
        } else if (
          testString === undefined ||
          testString.indexOf("undefined") !== -1
        ) {
          throw new Error("One or more fields are not defined");
        }
      } catch (e) {
        console.log("Evaluation error");
        error = true;
      }
      return !error;
    };
  }

  private replaceVariables(text: string) {
    return !text
      ? ""
      : text
          .replace(/organization/g, "address.organization")
          .replace(/lastName/g, "address.lastName")
          .replace(/firstName/g, "address.firstName");
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
}
