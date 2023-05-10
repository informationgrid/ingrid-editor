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
          className: "white-bg",
          props: {
            label: "URL",
            appearance: "outline",
          },
        },
        {
          fieldGroupClassName: "flex-row gap",
          fieldGroup: [
            {
              key: "ip",
              type: "input",
              className: "flex-1 white-bg",
              props: {
                label: "IP",
                appearance: "outline",
              },
            },
            {
              key: "port",
              type: "input",
              className: "flex-1 white-bg",
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
