import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable } from "rxjs";
import { SelectOptionUi } from "../app/services/codelist/codelist.service";
import { HttpClient } from "@angular/common/http";

export interface Options {
  id?: string;
  wrappers?: string[];
  className?: string;
  required?: boolean;
  defaultValue?: any;
  hasInlineContextHelp?: boolean;
  contextHelpId?: string;
  change?: (field, event) => void;
  remove?: (field, event) => void;
  expressions?: {
    hide?;
    className?;
    "props.required"?;
    "props.disabled"?;
  };
  hooks?: { onInit: (field) => void };
}

export interface DatePickerOptions extends Options {
  fieldLabel?: string;
  placeholder?: string;
  datepickerOptions?: any;
  validators?: any;
}

export interface RepeatOptions extends Options {
  menuOptions?: { key; value; fields }[];
  fieldGroupClassName?: string;
  fields?: FormlyFieldConfig[];
  validators?: { [x: string]: { expression: any; message: string } | string[] };
  // if true, the gap between repeats will be extended.
  hasExtendedGap?: boolean;
  addButtonTitle?: string;
}

export interface RepeatListOptions extends Options {
  fieldLabel?: string;
  placeholder?: string;
  codelistId?: number;
  asSelect?: boolean;
  showSearch?: boolean;
  fieldGroupClassName?: string; // TODO: move up
  options?: SelectOptionUi[] | Observable<SelectOptionUi[]>;
  view?: "chip" | "list";
  restCall?: (query: string) => Observable<any[]>;
  labelField?: string;
  selectLabelField?: string | ((item) => string);
  hint?: string;
  asAutocomplete?: boolean;
  asSimpleValues?: boolean;
}

export interface RepeatChipOptions extends Options {
  useDialog?: boolean;
  options?: any[] | Observable<any[]>;
  codelistId?: number;
  restCall?: (http: HttpClient, query: string) => Observable<any[]>;
  labelField?: string;
}

export interface SelectOptions extends Options {
  options?: any[] | Observable<any[]>;
  codelistId?: number;
  fieldLabel?: string;
  externalLabel?: string;
  showSearch?: boolean;
  allowNoValue?: boolean;
  change?: any;
  hooks?: any;
}

export interface TableOptions extends Options {
  columns?: any[];
  batchValidUntil?: string;
  validators?: any;
  supportUpload?: boolean;
  dialog?: any;
}

export interface CheckboxOptions extends Options {
  fieldLabel?: string;
  click?: ((field: FormlyFieldConfig, event?: any) => void) | any;
}

export interface InputOptions extends Options {
  type?: "number";
  fieldLabel?: string;
  disabled?: boolean;
  contextHelpId?: string;
  validators?: any;
  suffix?: any;
  prefix?: any;
  min?: number;
  max?: number;
  hintStart?: string;
  updateOn?: "change" | "blur" | "submit";
  keydown?: (field: FormlyFieldConfig, event) => void;
}

export interface AutocompleteOptions extends Options {
  fieldLabel?: string;
  placeholder?: string;
  highlightMatches?: boolean;
  hideDeleteButton?: boolean;
  options?: any[] | Observable<any[]>;
  codelistId?: number;
}

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
    const expressions = this.initExpressions(options?.expressions);
    return <FormlyFieldConfig>{
      key: id,
      id: options?.id,
      className: options?.className,
      fieldGroupClassName: options?.fieldGroupClassName ?? "flex-row",
      wrappers: options?.wrappers ?? ["panel"],
      props: {
        externalLabel: label,
        contextHelpId: options?.contextHelpId,
        required: options?.required,
      },
      fieldGroup: fields,
      expressions: {
        ...expressions,
        hide: options?.hideExpression,
      },
      validators: options?.validators,
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
      className: "top-align-suffix flex-1",
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
      validators: {
        addressesPublished: {
          expression: (ctrl) =>
            ctrl.value
              ? ctrl.value.every((row) => row.ref._state === "P")
              : false,
          message: "Alle Adressen müssen veröffentlicht sein",
        },
        ...options?.validators,
      },
    };
  }

  /**
   * @deprecated use addRepeatList
   */
  addRepeatChip(id, label, options?: RepeatChipOptions) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      id: options?.id,
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
        restCall: options?.restCall,
        labelField: options?.labelField,
      },
    };
  }

  addRepeatList(id, label, options?: RepeatListOptions) {
    const expressions = this.initExpressions(options?.expressions);
    let placeholder = this.determinePlaceholder(options);

    return <FormlyFieldConfig>{
      key: id,
      type: "repeatList",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      defaultValue: options?.defaultValue ?? [],
      fieldGroupClassName: options?.fieldGroupClassName,
      props: {
        externalLabel: label,
        placeholder: placeholder,
        fieldLabel: options?.fieldLabel,
        options: options?.options,
        codelistId: options?.codelistId,
        required: options?.required,
        asSelect: options?.asSelect,
        showSearch: options?.showSearch,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        change: options?.change,
        remove: options?.remove,
        view: options?.view,
        hint: options?.hint,
        restCall: options?.restCall,
        labelField: options?.labelField,
        selectLabelField: options?.selectLabelField ?? options?.labelField,
        asAutocomplete: options?.asAutocomplete ?? false,
        asSimpleValues: options?.asSimpleValues,
      },
      expressions: expressions,
    };
  }

  private determinePlaceholder(options: RepeatListOptions) {
    let placeholder = options?.placeholder;
    if (!placeholder && options?.asSelect) placeholder = "Bitte wählen...";
    if (!placeholder && options?.codelistId)
      placeholder = "Bitte wählen oder eingeben";
    if (!placeholder) placeholder = "Bitte eingeben";
    return placeholder;
  }

  addRepeatListInline(id, label, options: RepeatListOptions = {}) {
    return this.addRepeatList(id, null, {
      fieldLabel: label,
      wrappers: [],
      className: "flex-1",
      ...options,
    });
  }

  addRepeat(id, label, options?: RepeatOptions): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "repeat",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      defaultValue: options?.required ? options?.defaultValue ?? [{}] : null,
      props: {
        externalLabel: label,
        required: options?.required,
        minLength: options?.required ? 1 : undefined,
        menuOptions: options?.menuOptions,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        contextHelpId: options?.contextHelpId,
        hasExtendedGap: options?.hasExtendedGap,
        addButtonTitle: options?.addButtonTitle,
      },
      fieldArray: {
        fieldGroupClassName: options?.fieldGroupClassName ?? "flex-row",
        fieldGroup: options?.fields,
      },
      expressions: expressions,
      validators: options?.validators,
    };
  }

  addAutocomplete(id, label, options?: AutocompleteOptions) {
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
        placeholder: options?.placeholder ?? "Bitte wählen oder eingeben",
        appearance: "outline",
        required: options?.required,
        highlightMatches: options?.highlightMatches,
        hideDeleteButton: options?.hideDeleteButton,
        options: options?.options,
        codelistId: options?.codelistId,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        contextHelpId: options?.contextHelpId,
      },
    };
  }

  addAutoCompleteInline(id, label, options: AutocompleteOptions = {}) {
    return this.addAutocomplete(id, null, {
      fieldLabel: label,
      wrappers: ["form-field"],
      className: "flex-1",
      ...options,
    });
  }

  addInput(id, label, options?: InputOptions): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      id: options?.id,
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
        addonRight: options?.suffix,
        addonLeft: options?.prefix,
        min: options?.min,
        max: options?.max,
        hintStart: options?.hintStart,
        keydown: options?.keydown,
      },
      modelOptions: {
        updateOn: options?.updateOn ?? "blur",
      },
      expressions: expressions,
      validators: options?.validators,
      hooks: options?.hooks,
    };
  }

  addInputInline(id, label, options: InputOptions = {}): FormlyFieldConfig {
    return this.addInput(id, null, {
      fieldLabel: label,
      wrappers: options?.wrappers ?? ["form-field"],
      ...options,
    });
  }

  addSelect(id, label, options?: SelectOptions): FormlyFieldConfig {
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
        allowNoValue: options?.allowNoValue ?? !options?.required,
        codelistId: options?.codelistId,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        change: options?.change,
        contextHelpId: options?.contextHelpId,
      },
      expressions: expressions,
      hooks: options?.hooks,
    };
  }

  addSelectInline(id, label, options: SelectOptions = {}) {
    return this.addSelect(id, null, {
      fieldLabel: label,
      wrappers: ["form-field"],
      className: options.className ?? "flex-1",
      ...options,
    });
  }

  addTable(id, label, options?: TableOptions): FormlyFieldConfig {
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

  addPreviewImage(id, label, options?): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "previewImage",
      wrappers: options?.wrappers ?? ["panel"],
      expressions: expressions,
      props: {
        required: options?.required,
        externalLabel: label,
      },
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

  addDatepicker(id, label, options?: DatePickerOptions) {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "datepicker",
      className: options?.className ?? "ige-date-picker width-date-small",
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

  addDateRange(id, label, options?): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "date-range",
      className:
        options?.className === undefined
          ? "ige-date-picker"
          : options?.className,
      wrappers:
        options?.wrappers === undefined ? ["form-field"] : options?.wrappers,
      // defaultValue: null,
      /*fieldGroup: [
        { type: "input", key: "start" },
        { type: "input", key: "end" },
      ],*/
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
      },
    };
  }

  addCheckbox(id, label, options?: CheckboxOptions): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "checkbox",
      className: options?.className,
      wrappers: options?.wrappers ?? ["panel"],
      defaultValue: options?.defaultValue ?? false,
      props: {
        externalLabel: label,
        label: options?.fieldLabel,
        indeterminate: false,
        click: options?.click,
        isSuffixUnsupported: true,
        hasInlineContextHelp: options?.hasInlineContextHelp,
      },
      expressions: expressions,
    };
  }

  addCheckboxInline(id, label, options: CheckboxOptions = {}) {
    return this.addCheckbox(id, null, {
      fieldLabel: label,
      wrappers: ["inline-help"],
      ...options,
    });
  }

  addRadioboxes(id, label, options?): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "radio",
      wrappers: ["panel", "inline-help"],
      className: "ige-radios",
      props: {
        label: options?.fieldLabel,
        externalLabel: label,
        labelProp: "value",
        valueProp: "id",
        options: options?.options,
        required: options?.required,
        click: options?.click,
      },
      expressions: expressions,
    };
  }

  addReferencesForAddress(
    referenceField: string,
    uuidField: string = null,
    label = "Zugeordnete Datensätze",
    showOnStart?: boolean,
    showToggleButton?: boolean,
    messageNoReferences?: string,
    referencesHint?: string,
    options?
  ): FormlyFieldConfig {
    return {
      type: "referencedDocuments",
      wrappers: ["panel"],
      className: options?.className,
      props: {
        externalLabel: label,
        referenceField: referenceField,
        uuidField: uuidField ?? "ref",
        showOnStart: showOnStart,
        showToggleButton: showToggleButton,
        messageNoReferences: messageNoReferences,
        referencesHint: referencesHint,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        contextHelpId: options?.contextHelpId,
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
