import { FormlyFieldConfig } from "@ngx-formly/core";

export const messagesFields: FormlyFieldConfig[] = [
  {
    key: "messages",
    type: "table",
    templateOptions: {
      externalLabel: "Benachrichtigungen",
      columns: [
        {
          key: "text",
          type: "input",
          label: "Titel",
          width: "300px",
          templateOptions: {
            label: "Text",
            appearance: "outline",
          },
        },
        {
          key: "expiryDate",
          type: "datepicker",
          label: "Gültig bis",
          width: "100px",
          templateOptions: {
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
