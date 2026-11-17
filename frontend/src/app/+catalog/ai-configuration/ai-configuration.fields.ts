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
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormFieldHelper } from "../../../profiles/form-field-helper";

export function aiConfigFields(): FormlyFieldConfig[] {
  const fieldHelper = new FormFieldHelper();
  return [
    fieldHelper.addInput("hostUrl", "Host URL", {
      wrappers: ["panel", "form-field"],
      hintStart: "Das KI-API URL, z.B. https://api.anthropic.com/v1/",
    }),
    fieldHelper.addInput("modelId", "Model ID", {
      wrappers: ["panel", "form-field"],
      hintStart: "Die ID des Modells, z.B. claude-opus-5-5.",
    }),
    fieldHelper.addInput("apiKey", "API Key", {
      wrappers: ["panel", "form-field"],
      hintStart: "Nur bei Eingabe wird der Key überschrieben.",
    }),
    fieldHelper.addTextArea("roleDefinition", "Rolle (optional)", "", {
      rows: 4,
      hintStart:
        "Legen Sie fest, in welcher Rolle die KI antworten soll, z. B. Du bist ein Experte für die Qualitätsbewertung von Geodaten-Metadaten.",
    }),
    fieldHelper.addTextArea("instruction", "Anweisung (optional)", "", {
      rows: 16,
      hintStart:
        "Legen Sie fest, nach welchen Regeln oder Schritten die KI mit der Bewertung der Datensätzen vorgehen soll. Diese Einstellung wirkt sich stark auf das Ergebnis aus. Ändern Sie es nur, wenn Sie mit Prompt-Formulierungen vertraut sind.",
    }),
  ];
}
