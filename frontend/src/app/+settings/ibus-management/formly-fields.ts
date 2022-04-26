import { FormlyFieldConfig } from "@ngx-formly/core";

export const iBusFields: FormlyFieldConfig[] = [
  {
    type: "repeat",
    key: "ibus",
    wrappers: [],
    templateOptions: {
      noDrag: true,
    },
    fieldArray: {
      fieldGroup: [
        {
          key: "url",
          type: "input",
          templateOptions: {
            label: "URL",
            appearance: "outline",
          },
        },
        {
          fieldGroupClassName: "display-flex",
          fieldGroup: [
            {
              key: "ip",
              type: "input",
              className: "flex-1",
              templateOptions: {
                label: "IP",
                appearance: "outline",
              },
            },
            {
              key: "port",
              type: "input",
              className: "flex-1",
              templateOptions: {
                type: "number",
                label: "Port",
                appearance: "outline",
              },
            },
          ],
        },
      ],
    },
  },
];
