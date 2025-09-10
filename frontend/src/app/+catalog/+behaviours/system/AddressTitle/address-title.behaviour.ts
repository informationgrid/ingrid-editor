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

  private formatAddressString(address: any, template: string): string {
    // Remove backticks if present
    const cleanTemplate = template.replace(/^`|`$/g, "");

    // Replace ${...} expressions with actual values
    return cleanTemplate.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        // Parse simple expressions safely
        return this.evaluateExpression(expression.trim(), address);
      } catch (error) {
        console.warn(`Failed to evaluate expression: ${expression}`, error);
        return match; // Return original if evaluation fails
      }
    });
  }

  private evaluateExpression(expression: string, address: any): string {
    // Handle simple property access and ternary operations
    if (expression.includes("?")) {
      return this.evaluateTernary(expression, address);
    }

    // Handle simple property access
    const value = this.getNestedProperty(address, expression);
    return value != null ? String(value) : "";
  }

  private evaluateTernary(expression: string, address: any): string {
    const parts = expression.split("?");
    if (parts.length !== 2) return "";

    const condition = parts[0].trim();
    const consequences = parts[1].split(":");
    if (consequences.length !== 2) return "";

    const trueValue = consequences[0].trim();
    const falseValue = consequences[1].trim();

    // Evaluate condition
    const conditionResult = this.evaluateCondition(condition, address);

    if (conditionResult) {
      return this.evaluateValueExpression(trueValue, address);
    } else {
      return this.evaluateValueExpression(falseValue, address);
    }
  }

  private evaluateCondition(condition: string, address: any): boolean {
    // Handle simple property existence checks
    const value = this.getNestedProperty(address, condition);
    return Boolean(value);
  }

  private evaluateValueExpression(expression: string, address: any): string {
    // Handle string concatenation and property access
    if (expression.includes("+")) {
      const parts = expression.split("+").map((part) => part.trim());
      return parts
        .map((part) => {
          if (part.startsWith('"') && part.endsWith('"')) {
            // String literal
            return part.slice(1, -1);
          } else {
            // Property access
            const value = this.getNestedProperty(address, part);
            return value != null ? String(value) : "";
          }
        })
        .join("");
    }

    // Simple property access or string literal
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1);
    }

    const value = this.getNestedProperty(address, expression);
    return value != null ? String(value) : "";
  }

  private getNestedProperty(obj: any, path: string): any {
    const splittedPath = path.split(".");
    splittedPath.shift();
    return splittedPath.reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
}
