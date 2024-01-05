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
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistService } from "../../services/codelist/codelist.service";

export const fields = (codelistService: CodelistService) =>
  <FormlyFieldConfig[]>[
    {
      key: "catalogName",
      type: "input",
      wrappers: ["panel", "form-field"],
      className: "width-100",
      props: {
        externalLabel: "Katalogname",
        appearance: "outline",
      },
    },
    {
      key: "description",
      type: "textarea",
      wrappers: ["panel", "form-field"],
      className: "width-100",
      props: {
        externalLabel: "Beschreibung",
        appearance: "outline",
      },
    },
    {
      key: "partner",
      type: "ige-select",
      wrappers: ["panel", "form-field"],
      className: "width-100",
      props: {
        externalLabel: "Partner",
        appearance: "outline",
        options: codelistService.observe("110"),
        showSearch: true,
        allowNoValue: true,
        simple: true,
      },
    },
    {
      key: "provider",
      type: "ige-select",
      wrappers: ["panel", "form-field"],
      className: "width-100",
      props: {
        externalLabel: "Anbieter",
        appearance: "outline",
        options: codelistService.observe("111"),
        showSearch: true,
        allowNoValue: true,
        simple: true,
      },
    },
    {
      key: "elasticsearchAlias",
      type: "input",
      wrappers: ["panel", "form-field"],
      className: "width-100",
      props: {
        externalLabel: "Elasticsearch Alias",
        appearance: "outline",
      },
    },
    {
      key: "namespace",
      type: "textarea",
      wrappers: ["panel", "form-field"],
      props: {
        externalLabel: "Namespace",
        appearance: "outline",
      },
    },
    {
      key: "atomDownloadUrl",
      type: "input",
      wrappers: ["panel", "form-field"],
      props: {
        externalLabel: "ATOM-Downloadservice-URL",
        appearance: "outline",
      },
    },
    {
      key: "spatialReference",
      type: "leaflet",
      wrappers: ["panel"],
      props: {
        externalLabel: "Raumbezug",
        max: 1,
        height: 200,
      },
    },
    {
      wrappers: ["section"],
      key: "expiredDatasetConfig",
      props: {
        label: "Abgelaufene Metadaten",
      },
      fieldGroup: [
        {
          key: "emailEnabled",
          type: "checkbox",
          wrappers: ["panel"],
          props: {
            externalLabel: "E-Mail über abgelaufene Metadaten senden",
            appearance: "outline",
          },
        },
        {
          key: "repeatExpiry",
          type: "checkbox",
          wrappers: ["panel"],
          props: {
            externalLabel: "E-Mail nach erneutem Ablauf senden",
            appearance: "outline",
          },
        },
        {
          key: "expiryDuration",
          type: "number",
          wrappers: ["panel", "form-field"],
          props: {
            externalLabel: "Zeitraum der Gültigkeit von Metadaten in Tagen",
            appearance: "outline",
          },
        },
        {
          key: "notifyDaysBeforeExpiry",
          type: "number",
          wrappers: ["panel", "form-field"],
          props: {
            externalLabel: "E-Mail vor Ablauf in Tagen (optional)",
            appearance: "outline",
          },
        },
      ],
    },
  ];
