/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { McpServerEntryComponent } from "./mcp-server-entry/mcp-server-entry.component";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormFieldHelper } from "../../../profiles/form-field-helper";

export function aiConfigFields(): FormlyFieldConfig[] {
  const fieldHelper = new FormFieldHelper();
  return [
    fieldHelper.addInput("hostUrl", "Host URL", {
      wrappers: ["panel", "form-field"],
    }),
    fieldHelper.addInput("modelId", "Model ID", {
      wrappers: ["panel", "form-field"],
    }),
    fieldHelper.addInput("apiKey", "API Key", {
      wrappers: ["panel", "form-field"],
      hintStart: "Nur bei Eingabe wird der Key überschrieben.",
    }),
    fieldHelper.addRepeatDetailList("mcpServers", "MCP Server", {
      viewComponent: McpServerEntryComponent,
      fields: [
        fieldHelper.addInputInline("name", "Server Name", {
          required: true,
        }),
        fieldHelper.addInputInline("url", "URL", {
          required: true,
        }),
        fieldHelper.addInputInline("apiKey", "API Key", {
          hintStart: "Nur bei Eingabe wird der Key überschrieben.",
        }),
        fieldHelper.addTextAreaInline("customHeaders", "Custom-Headers", "", {
          rows: 3,
          validators: {
            validation: ["valid_json"],
          },
        }),
      ],
    }),
    fieldHelper.addTextArea("instruction", "Anweisung", "", {
      rows: 16,
    }),
  ];
}
