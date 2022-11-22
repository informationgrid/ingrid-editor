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
          props: {
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
              props: {
                label: "IP",
                appearance: "outline",
              },
            },
            {
              key: "port",
              type: "input",
              className: "flex-1",
              props: {
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
