import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistService } from "../../services/codelist/codelist.service";

export const fields = (codelistService: CodelistService) =>
  <FormlyFieldConfig[]>[
    {
      key: "catalogName",
      type: "input",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Katalogname",
        appearance: "outline",
      },
    },
    {
      key: "description",
      type: "textarea",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Beschreibung",
        appearance: "outline",
      },
    },
    {
      key: "partner",
      type: "select",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Ansprechpartner",
        appearance: "outline",
        options: codelistService.observe("110"),
        showSearch: true,
        simple: true,
      },
    },
    {
      key: "provider",
      type: "select",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Anbieter",
        appearance: "outline",
        options: codelistService.observe("111"),
        showSearch: true,
        simple: true,
      },
    },
    {
      key: "elasticsearchAlias",
      type: "input",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Elasticsearch Alias",
        appearance: "outline",
      },
    },
  ];
