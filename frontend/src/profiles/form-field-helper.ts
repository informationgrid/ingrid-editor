import { FormlyFieldConfig } from "@ngx-formly/core";

export class FormFieldHelper {
  addSection(label: string, fields: any[]) {
    return {
      wrappers: ["section"],
      props: {
        label: label,
      },
      fieldGroup: fields,
    };
  }

  addGroup(id: string, label: string, fields: any[], options?) {
    return <FormlyFieldConfig>{
      key: id,
      id: id,
      className: options?.className,
      fieldGroupClassName: options?.fieldGroupClassName ?? "display-flex",
      wrappers: options?.wrappers ?? ["panel"],
      props: {
        externalLabel: label,
        contextHelpId: options?.contextHelpId,
      },
      fieldGroup: fields,
      expressions: { hide: options?.hideExpression },
    };
  }

  addGroupSimple(id: string, fields: any[], options?: any) {
    return this.addGroup(id, null, fields, {
      fieldGroupClassName: "",
      wrappers: [],
      ...options,
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
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "textarea",
      // className: id,
      className: (options?.className ?? "flex-1") + ` ${id}`,
      id: elementIdPrefix + id,
      wrappers: options?.wrappers ?? ["panel", "form-field"],
      props: {
        externalLabel: label,
        label: options?.fieldLabel,
        autosize: false,
        autosizeMinRows: 3,
        attributes: {
          style: "resize:vertical;min-height:54px",
        },
        appearance: "outline",
        required: options?.required,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        contextHelpId: options?.contextHelpId,
      },
      expressions: expressions,
    };
  }

  addTextAreaInline(
    id,
    label,
    elementIdPrefix,
    options = {}
  ): FormlyFieldConfig {
    return this.addTextArea(id, null, elementIdPrefix, {
      wrappers: ["form-field"],
      fieldLabel: label,
      ...options,
    });
  }

  addAddressCard(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "address-card",
      wrappers: ["panel"],
      expressions: expressions,
      props: {
        externalLabel: label,
        required: options?.required,
        allowedTypes: options?.allowedTypes,
        max: options?.max,
      },
      validators: options?.validators,
    };
  }

  addRepeatChip(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      id: id,
      type: "repeatChip",
      wrappers: ["panel"],
      defaultValue: [],
      expressions: expressions,
      props: {
        externalLabel: label,
        required: options?.required,
        useDialog: options?.useDialog,
        options: options?.options,
        codelistId: options?.codelistId,
      },
    };
  }

  addRepeatList(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return <FormlyFieldConfig>{
      key: id,
      type: "repeatList",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      defaultValue: [],
      props: {
        externalLabel: label,
        placeholder: options?.fieldLabel ?? "Bitte wählen...",
        options: options?.options,
        codelistId: options?.codelistId,
        required: options?.required,
        asSelect: options?.asSelect,
        showSearch: options?.showSearch,
        hasInlineContextHelp: options?.hasInlineContextHelp,
      },
      expressions: expressions,
    };
  }

  addRepeatListInline(id, label, options = {}) {
    return this.addRepeatList(id, null, {
      fieldLabel: label,
      wrappers: [],
      className: "flex-1",
      ...options,
    });
  }

  addRepeat(id, label, options?): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "repeat",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      defaultValue: options?.required ? [{}] : null,
      props: {
        externalLabel: label,
        required: options?.required,
        minLength: options?.required ? 1 : undefined,
        menuOptions: options?.menuOptions,
      },
      fieldArray: {
        fieldGroupClassName: options?.fieldGroupClassName ?? "display-flex",
        fieldGroup: options?.fields,
      },
      expressions: expressions,
    };
  }

  addAutocomplete(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "autocomplete",
      className: options?.className,
      wrappers: options?.wrappers ?? ["panel", "form-field"],
      expressions: expressions,
      props: {
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
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      id: id,
      type: "input",
      className: options?.className ?? "flex-1",
      wrappers: options?.wrappers ?? ["form-field"],
      props: {
        type: options?.type,
        externalLabel: label,
        label: options?.fieldLabel,
        required: options?.required,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        appearance: "outline",
        disabled: options?.disabled,
        contextHelpId: options?.contextHelpId,
      },
      modelOptions: {
        updateOn: "blur",
      },
      expressions: expressions,
      validators: options?.validators,
    };
  }

  addInputInline(id, label, options = {}): FormlyFieldConfig {
    return this.addInput(id, null, {
      fieldLabel: label,
      wrappers: ["form-field"],
      ...options,
    });
  }

  addSelect(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "select",
      className: options?.className,
      defaultValue: options?.defaultValue ?? null,
      wrappers:
        options?.wrappers === undefined
          ? ["panel", "form-field"]
          : options?.wrappers,
      props: {
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
      expressions: expressions,
    };
  }

  addSelectInline(id, label, options: any = {}) {
    return this.addSelect(id, null, {
      fieldLabel: label,
      wrappers: ["form-field"],
      className: options.className ?? "flex-1",
      ...options,
    });
  }

  addTable(id, label, options?): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "table",
      className: options?.className,
      wrappers: options?.wrappers,
      props: {
        externalLabel: label,
        required: options?.required,
        columns: options?.columns,
        batchValidUntil: options?.batchValidUntil,
        supportUpload: options?.supportUpload ?? true,
        dialog: options?.dialog,
      },
      validators: options?.validators,
      expressions: expressions,
    };
  }

  addSpatial(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "leaflet",
      wrappers: [],
      expressions: expressions,
      props: {
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
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "datepicker",
      className: "flex-1",
      wrappers:
        options?.wrappers === undefined
          ? ["panel", "form-field"]
          : options?.wrappers,
      defaultValue: null,
      props: {
        label: options?.fieldLabel,
        externalLabel: label,
        placeholder: options?.placeholder ?? "TT.MM.JJJJ",
        appearance: "outline",
        required: options?.required,
        datepickerOptions: options?.datepickerOptions,
      },
      expressions: expressions,
      validators: options?.validators,
    };
  }

  addDatepickerInline(id, label, options = {}) {
    return this.addDatepicker(id, null, {
      fieldLabel: label,
      wrappers: ["form-field"],
      ...options,
    });
  }

  addDateRange(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "date-range",
      className:
        options?.className === undefined ? "flex-1" : options?.className,
      wrappers:
        options?.wrappers === undefined ? ["form-field"] : options?.wrappers,
      defaultValue: null,
      props: {
        placeholder: "Zeitraum eingeben ...",
        externalLabel: label,
        appearance: "outline",
        required: options?.required,
      },
      expressions: expressions,
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
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "checkbox",
      className: options?.className,
      wrappers: options?.wrappers ?? ["panel", "form-field", "inline-help"],
      props: {
        externalLabel: label,
        label: options?.fieldLabel,
        indeterminate: false,
        required: options?.required,
      },
      expressions: expressions,
    };
  }

  addCheckboxInline(id, label, options = {}) {
    return this.addCheckbox(id, null, {
      fieldLabel: label,
      wrappers: ["form-field", "inline-help"],
      ...options,
    });
  }

  addRadioboxes(id, label, options?) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "radio",
      wrappers: ["panel", "form-field", "inline-help"],
      className: "ige-radios",
      props: {
        label: options?.fieldLabel,
        externalLabel: label,
        labelProp: "value",
        valueProp: "id",
        options: options?.options,
        required: options?.required,
      },
      expressions: expressions,
    };
  }

  addReferencesForAddress(referenceField: string) {
    return {
      type: "referencedDocuments",
      wrappers: ["panel"],
      props: {
        externalLabel: "Zugeordnete Datensätze",
        referenceField: referenceField,
      },
    };
  }

  private initExpressions(expressions = {}) {
    return {
      "props.disabled": "formState.disabled",
      ...expressions,
    };
  }
}
