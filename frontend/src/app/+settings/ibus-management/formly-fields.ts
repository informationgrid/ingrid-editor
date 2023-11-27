import { FormlyFieldConfig } from "@ngx-formly/core";

export const iBusFields: FormlyFieldConfig[] = [
  {
    type: "repeat",
    key: "ibus",
    wrappers: [],
    props: {
      noDrag: true,
    },
    fieldArray: {
      fieldGroup: [
        {
          key: "url",
          type: "input",
          className: "white-bg url",
          props: {
            label: "URL",
            appearance: "outline",
          },
        },
        {
          fieldGroupClassName: "flex-row gap-6",
          fieldGroup: [
            {
              key: "ip",
              type: "input",
              className: "flex-1 white-bg ip",
              props: {
                label: "IP",
                appearance: "outline",
              },
            },
            {
              key: "port",
              type: "input",
              className: "flex-1 white-bg port",
              props: {
                type: "number",
                label: "Port",
                appearance: "outline",
              },
            },
          ],
        },
        {
          key: "publicationTypes",
          type: "select",
          defaultValue: ["internet"],
          className: "white-bg publicationTypes",
          props: {
            label: "Veröffentlichungsrecht",
            placeholder: "",
            appearance: "outline",
            multiple: true,
            simple: true,
            options: [
              { value: "internet", label: "Internet" },
              { value: "intranet", label: "Intranet" },
              { value: "amtsintern", label: "amtsintern" },
            ],
          },
          modelOptions: {
            updateOn: "blur",
          },
        },
      ],
    },
  },
];
