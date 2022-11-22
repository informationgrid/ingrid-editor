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
    return <FormlyFieldConfig>{
      key: id,
      id: id,
      fieldGroupClassName: options?.fieldGroupClassName ?? "display-flex",
      wrappers: options?.wrappers ?? ["panel"],
      templateOptions: {
        externalLabel: label,
      },
      fieldGroup: fields,
      hideExpression: options?.hideExpression,
    };
  }

  addGroupSimple(id: string, fields: any[], options?: any) {
    return this.addGroup(id, null, fields, {
      fieldGroupClassName: options?.fieldGroupClassName ?? "",
      wrappers: [],
    });
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
      // className: id,
      className: (options?.className ?? "flex-1") + ` ${id}`,
      id: elementIdPrefix + id,
      wrappers: options?.wrappers ?? ["panel", "form-field"],
      templateOptions: {
        externalLabel: label,
        label: options?.fieldLabel,
        autosize: false,
        autosizeMinRows: 3,
        attributes: {
          style: "resize:vertical;min-height:54px",
        },
        appearance: "outline",
        required: options?.required,
      },
      hideExpression: options?.hideExpression,
    };
  }

  addTextAreaInline(
    id,
    label,
    elementIdPrefix,
    options = {}
  ): FormlyFieldConfig {
    return this.addTextArea(id, null, elementIdPrefix, {
      ...options,
      wrappers: ["form-field"],
      fieldLabel: label,
    });
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
      id: id,
      type: "repeatChip",
      wrappers: ["panel"],
      defaultValue: [],
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
    return <FormlyFieldConfig>{
      key: id,
      type: "repeatList",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      expressions: options?.expressions,
      defaultValue: [],
      templateOptions: {
        externalLabel: label,
        placeholder: options?.fieldLabel ?? "Bitte wählen...",
        options: options?.options,
        codelistId: options?.codelistId,
        required: options?.required,
        asSelect: options?.asSelect,
        showSearch: options?.showSearch,
      },
      hideExpression: options?.hideExpression,
    };
  }

  addRepeatListInline(id, label, options = {}) {
    return this.addRepeatList(id, null, {
      ...options,
      fieldLabel: label,
      wrappers: [],
      className: "flex-1",
    });
  }

  addRepeat(id, label, options?) {
    return {
      key: id,
      type: "repeat",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      defaultValue: options?.required ? [{}] : null,
      templateOptions: {
        externalLabel: label,
        required: options?.required,
        minLength: options?.required ? 1 : undefined,
        menuOptions: options?.menuOptions,
      },
      fieldArray: {
        fieldGroupClassName: options?.fieldGroupClassName ?? "display-flex",
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
      hideExpression: options?.hideExpression,
      templateOptions: {
        externalLabel: label,
        label: options?.fieldLabel,
        placeholder: options?.placeholder ?? "Bitte wählen",
        appearance: "outline",
        required: options?.required,
        highlightMatches: options?.highlightMatches,
        hideDeleteButton: options?.hideDeleteButton,
        options: options?.options,
        codelistId: options?.codelistId,
      },
    };
  }

  addInput(id, label, options?): FormlyFieldConfig {
    return {
      key: id,
      id: id,
      type: "input",
      className: options?.className ?? "flex-1",
      wrappers: options?.wrappers ?? ["form-field"],
      templateOptions: {
        type: options?.type,
        externalLabel: label,
        label: options?.fieldLabel,
        required: options?.required,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        appearance: "outline",
        disabled: options?.disabled,
      },
      modelOptions: {
        updateOn: "blur",
      },
      expressionProperties: options?.expressionProperties,
      hideExpression: options?.hideExpression,
      validators: options?.validators,
    };
  }

  addInputInline(id, label, options = {}): FormlyFieldConfig {
    return this.addInput(id, null, {
      ...options,
      fieldLabel: label,
      wrappers: ["form-field"],
    });
  }

  addSelect(id, label, options?) {
    return {
      key: id,
      type: "select",
      className: options?.className,
      defaultValue: options?.defaultValue ?? null,
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
        codelistId: options?.codelistId,
      },
      hideExpression: options?.hideExpression,
    };
  }

  addSelectInline(id, label, options: any = {}) {
    return this.addSelect(id, null, {
      ...options,
      fieldLabel: label,
      wrappers: ["form-field"],
      className: options.className ?? "flex-1",
    });
  }

  addTable(id, label, options?): FormlyFieldConfig {
    return {
      key: id,
      type: "table",
      className: options?.className,
      wrappers: options?.wrappers,
      templateOptions: {
        externalLabel: label,
        required: options?.required,
        columns: options?.columns,
        batchValidUntil: options?.batchValidUntil,
        supportUpload: options?.supportUpload ?? true,
        dialog: options?.dialog,
      },
      validators: options?.validators,
      hideExpression: options?.hideExpression,
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
      defaultValue: null,
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
      defaultValue: null,
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
      className: options?.className,
      wrappers: options?.wrappers ?? ["panel", "form-field", "inline-help"],
      templateOptions: {
        externalLabel: label,
        label: options?.fieldLabel,
        indeterminate: false,
        required: options?.required,
      },
      hideExpression: options?.hideExpression,
    };
  }

  addCheckboxInline(id, label, options = {}) {
    return this.addCheckbox(id, null, {
      ...options,
      fieldLabel: label,
      wrappers: ["form-field", "inline-help"],
    });
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
      hideExpression: options?.hideExpression,
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
