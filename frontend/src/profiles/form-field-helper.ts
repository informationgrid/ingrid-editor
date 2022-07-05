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

  /**
   * Add a text area with the id `elementIdPrefix + id`
   * @param id
   * @param label
   * @param elementIdPrefix is needed here to remember text area height correctly
   * @param options
   */
  addTextArea(id, label, elementIdPrefix, options?): FormlyFieldConfig {
    return {
      key: id,
      type: "textarea",
      className: id,
      id: elementIdPrefix + id,
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: label,
        autosize: false,
        autosizeMinRows: 3,
        attributes: {
          style: "resize:vertical;min-height:54px",
        },
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
        max: options?.max,
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

  addRepeatList(id, label, options?) {
    return {
      key: id,
      type: "repeatList",
      wrappers: ["panel"],
      templateOptions: {
        externalLabel: label,
        placeholder: "Bitte wählen...",
        options: options?.options,
        codelistId: options?.codelistId,
        required: options?.required,
        asSelect: options?.asSelect,
        showSearch: options?.showSearch,
      },
    };
  }

  addRepeat(id, label, options?) {
    return {
      key: id,
      type: "repeat",
      wrappers: ["panel"],
      className: options?.className,
      templateOptions: {
        externalLabel: label,
        required: options?.required,
        minLength: options?.required ? 1 : undefined,
      },
      fieldArray: {
        fieldGroupClassName: "display-flex",
        fieldGroup: options?.fields,
      },
    };
  }

  addAutocomplete(id, label, options?) {
    return {
      key: id,
      type: "autocomplete",
      className: options?.className,
      wrappers: options?.wrappers ?? ["panel", "form-field"],
      templateOptions: {
        externalLabel: label,
        placeholder: options?.placeholder ?? "Bitte wählen",
        appearance: "outline",
        required: options?.required,
        highlightMatches: options?.highlightMatches,
        hideDeleteButton: options?.hideDeleteButton,
        options: options?.options,
      },
    };
  }

  addInput(id, label, options?): FormlyFieldConfig {
    return {
      key: id,
      type: "input",
      className: options?.className ?? "flex-1",
      wrappers: options?.wrappers,
      templateOptions: {
        externalLabel: label,
        label: options?.fieldLabel,
        required: options?.required,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        appearance: "outline",
      },
      modelOptions: {
        updateOn: "blur",
      },
      expressionProperties: options?.expressionProperties,
      hideExpression: options?.hideExpression,
      validators: options?.validators,
    };
  }

  addSelect(id, label, options?) {
    return {
      key: id,
      type: "select",
      className: options?.className,
      defaultValue: options?.defaultValue,
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
      hideExpression: options?.hideExpression,
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
        batchValidUntil: options?.batchValidUntil,
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
        required: options?.required,
        mapOptions: {},
        externalLabel: label,
        height: 386,
        limitTypes: options?.limitTypes,
        max: options?.max,
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
        datepickerOptions: options?.datepickerOptions,
      },
      hideExpression: options?.hideExpression,
      validators: options?.validators,
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
        required: options?.required,
      },
      hideExpression: options?.hideExpression,
      validators: options?.validators ?? {
        required: {
          expression: (ctrl) =>
            !options?.required ||
            !(ctrl.value?.start === null && ctrl.value?.end === null),
        },
        validStartEnd: {
          expression: (ctrl) =>
            (ctrl.value?.start === null && ctrl.value?.end === null) ||
            (ctrl.value?.start && ctrl.value?.end),
          message: "Das Start- und Enddatum muss gültig sein",
        },
      },
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
      hideExpression: options?.hideExpression,
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

  addReferencesForAddress(referenceField: string) {
    return {
      type: "referencedDocuments",
      wrappers: ["panel"],
      templateOptions: {
        externalLabel: "Zugeordnete Datensätze",
        referenceField: referenceField,
      },
    };
  }
}
