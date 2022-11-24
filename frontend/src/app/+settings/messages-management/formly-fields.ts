import { FormlyFieldConfig } from "@ngx-formly/core";

export const messagesFields: FormlyFieldConfig[] = [
  {
    key: "messages",
    type: "table",
    props: {
      externalLabel: "Benachrichtigungen",
      columns: [
        {
          key: "text",
          type: "input",
          label: "Titel",
          width: "300px",
          props: {
            label: "Text",
            appearance: "outline",
          },
        },
        {
          key: "validUntil",
          type: "datepicker",
          label: "Gültig bis",
          width: "100px",
          props: {
            label: "Gültig bis",
            appearance: "outline",
            formatter: (item: any) => {
              return item ? new Date(item).toLocaleDateString() : "";
            },
          },
        },
      ],
    },
  },
];
