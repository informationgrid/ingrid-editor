import { FormlyFieldConfig } from "@ngx-formly/core";

export class FormFieldHelper {
  addSection(label: string, fields: any[]) {
    return {
      wrappers: ["section"],
      templateOptions: {
        label: label,
      },
      fieldGroup: fields,
    };
  }

  addGroup(id: string, label: string, fields: any[], options?) {
    return {
      key: id,
      fieldGroupClassName:
        options?.fieldGroupClassName === null ? undefined : "display-flex",
      wrappers: ["panel"],
      templateOptions: {
        externalLabel: label,
      },
      fieldGroup: fields,
    };
  }

  addTextArea(id, label, options?) {
    return {
      key: id,
      type: "textarea",
      className: id,
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: label,
        autosize: true,
        autosizeMinRows: 3,
        autosizeMaxRows: 8,
        appearance: "outline",
        required: options?.required,
      },
    };
  }

  addAddressCard(id, label, options?) {
    return {
      key: id,
      type: "address-card",
      wrappers: ["panel"],
      templateOptions: {
        externalLabel: label,
        required: options?.required,
        allowedTypes: options?.allowedTypes,
      },
      validators: options?.validators,
    };
  }

  addRepeatChip(id, label, options?) {
    return {
      key: id,
      type: "repeatChip",
      wrappers: ["panel"],
      templateOptions: {
        externalLabel: label,
        required: options?.required,
        useDialog: options?.useDialog,
        options: options?.options,
        codelistId: options?.codelistId,
      },
    };
  }

  addAutocomplete(id, label, options?) {
    return {
      key: id,
      type: "autocomplete",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: label,
        placeholder: "Bitte wählen",
        appearance: "outline",
        required: options?.required,
        options: options?.options,
      },
    };
  }

  addInput(id, label, options?) {
    return {
      key: id,
      type: "input",
      className: options?.className ?? "flex-1",
      wrappers: options?.wrappers,
      templateOptions: {
        label: options?.fieldLabel,
        required: options?.required,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        appearance: "outline",
      },
      validators: options?.validators,
    };
  }

  addSelect(id, label, options?) {
    return {
      key: id,
      type: "select",
      className: options?.className,
      wrappers:
        options?.wrappers === undefined
          ? ["panel", "form-field"]
          : options?.wrappers,
      templateOptions: {
        placeholder: "Wählen...",
        label: options?.fieldLabel,
        externalLabel: options?.externalLabel === null ? undefined : label,
        appearance: "outline",
        required: options?.required,
        options: options?.options,
        showSearch: options?.showSearch,
        allowNoValue: options?.allowNoValue,
      },
    };
  }

  addTable(id, label, options?): FormlyFieldConfig {
    return {
      key: id,
      type: "table",
      templateOptions: {
        externalLabel: label,
        required: options?.required,
        columns: options?.columns,
      },
      validators: options?.validators,
    };
  }

  addSpatial(id, label, options?) {
    return {
      key: id,
      type: "leaflet",
      wrappers: [],
      templateOptions: {
        mapOptions: {},
        externalLabel: label,
        height: 386,
      },
    };
  }

  addDatepicker(id, label, options?) {
    return {
      key: id,
      type: "datepicker",
      className: "flex-1",
      wrappers:
        options?.wrappers === undefined
          ? ["panel", "form-field"]
          : options?.wrappers,
      templateOptions: {
        label: options?.fieldLabel,
        externalLabel: label,
        placeholder: options?.placeholder ?? "TT.MM.JJJJ",
        appearance: "outline",
        required: options?.required,
      },
      hideExpression: options?.hideExpression,
    };
  }

  addDateRange(id, label, options?) {
    return {
      key: id,
      type: "date-range",
      className:
        options?.className === undefined ? "flex-1" : options?.className,
      wrappers:
        options?.wrappers === undefined ? ["form-field"] : options?.wrappers,
      templateOptions: {
        placeholder: "Zeitraum eingeben ...",
        externalLabel: label,
        appearance: "outline",
      },
      hideExpression: options?.hideExpression,
    };
  }

  addCheckbox(id, label, options?) {
    return {
      key: id,
      type: "checkbox",
      wrappers: ["panel", "form-field", "inline-help"],
      templateOptions: {
        externalLabel: label,
        label: options?.fieldLabel,
        indeterminate: false,
        required: options?.required,
      },
    };
  }

  addRadioboxes(id, label, options?) {
    return {
      key: id,
      type: "radio",
      wrappers: ["panel", "form-field", "inline-help"],
      className: "ige-radios",
      templateOptions: {
        label: options?.fieldLabel,
        externalLabel: label,
        labelProp: "value",
        valueProp: "id",
        options: options?.options,
        required: options?.required,
      },
    };
  }
}
