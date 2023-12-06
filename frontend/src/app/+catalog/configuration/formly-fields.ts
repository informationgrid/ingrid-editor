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
      type: "select",
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
      type: "select",
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
