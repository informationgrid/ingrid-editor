import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable } from "rxjs";
import { SelectOptionUi } from "../app/services/codelist/codelist.service";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { toAriaLabelledBy } from "../app/directives/fieldToAiraLabelledby.pipe";

export interface Options {
  id?: string;
  wrappers?: string[];
  className?: string;
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  hasInlineContextHelp?: boolean;
  contextHelpId?: string;
  change?: (field, event) => void;
  remove?: (field, event) => void;
  expressions?: {
    hide?;
    className?;
    defaultValue?;
    "props.required"?;
    "props.disabled"?;
    "props.minLength"?;
    "props.hintStart"?;
  };
  hooks?: { onInit: (field) => void };
  buttonConfig?: { text: string; onClick: (buttonConfig, field) => void };
  hideInPreview?: boolean;
  validators?: any;
  asyncValidators?: any;
}

export interface DatePickerOptions extends Options {
  fieldLabel?: string;
  placeholder?: string;
  datepickerOptions?: any;
  validators?: any;
  suffix?: any;
  prefix?: any;
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

export interface RepeatDetailListOptions extends Options {
  fields?: FormlyFieldConfig[];
  validators?: { [x: string]: { expression: any; message: string } | string[] };
  titleField?: string;
  infoText?: string;
}

export interface RepeatListOptions extends Options {
  fieldLabel?: string;
  placeholder?: string;
  codelistId?: number;
  asSelect?: boolean;
  showSearch?: boolean;
  fieldGroupClassName?: string; // TODO: move up
  options?: Partial<SelectOptionUi>[] | Observable<Partial<SelectOptionUi>[]>;
  view?: "chip" | "list";
  restCall?: (query: string) => Observable<any[]>;
  labelField?: string;
  selectLabelField?: string | ((item) => string);
  hint?: string;
  asAutocomplete?: boolean;
  asSimpleValues?: boolean;
  convert?: (value) => any;
  isSuffixUnsupported?: boolean;
}

export interface RepeatChipOptions extends Options {
  useDialog?: boolean;
  options?: any[] | Observable<any[]>;
  codelistId?: number;
  restCall?: (http: HttpClient, query: string) => Observable<any[]>;
  labelField?: string;
}

export interface SelectOptions extends Options {
  options?: Partial<SelectOptionUi>[] | Observable<Partial<SelectOptionUi>[]>;
  codelistId?: number;
  fieldLabel?: string;
  externalLabel?: string;
  showSearch?: boolean;
  allowNoValue?: boolean;
  noValueLabel?: string;
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
  validation?: any;
  suffix?: any;
  prefix?: any;
  min?: number;
  max?: number;
  hintStart?: string | any;
  updateOn?: "change" | "blur" | "submit";
  keydown?: (field: FormlyFieldConfig, event) => void;
  placeholder?: string;
}

export interface TextAreaOptions extends Options {
  fieldLabel?: string;
  rows?: number;
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
  protected transloco = inject(TranslocoService);

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
      fieldGroupClassName: options?.fieldGroupClassName ?? "",
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
  addTextArea(
    id,
    label,
    elementIdPrefix,
    options?: TextAreaOptions,
  ): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return <FormlyFieldConfig>{
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
        rows: options?.rows ?? "3",
        attributes: {
          style: "resize:vertical;",
        },
        appearance: "outline",
        required: options?.required,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        contextHelpId: options?.contextHelpId,
      },
      expressions: {
        ...expressions,
        "props.attributes.aria-labelledby": (field: FormlyFieldConfig) =>
          toAriaLabelledBy(field),
      },
    };
  }

  addTextAreaInline(
    id,
    label,
    elementIdPrefix,
    options: Options = {},
  ): FormlyFieldConfig {
    return this.addTextArea(id, null, elementIdPrefix, {
      className: "top-align-suffix flex-1",
      wrappers: options?.wrappers ?? ["form-field"],
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
        contextHelpId: options?.contextHelpId,
        isSuffixUnsupported: options?.isSuffixUnsupported,
        change: options?.change,
        remove: options?.remove,
        view: options?.view,
        hint: options?.hint,
        restCall: options?.restCall,
        labelField: options?.labelField,
        selectLabelField: options?.selectLabelField ?? options?.labelField,
        asAutocomplete: options?.asAutocomplete ?? false,
        asSimpleValues: options?.asSimpleValues,
        convert: options?.convert,
      },
      expressions: expressions,
      validators: options?.validators,
    };
  }

  addRepeatDetailList(
    id,
    label,
    options?: RepeatDetailListOptions,
  ): FormlyFieldConfig {
    const expressions = this.initExpressions(options?.expressions);
    return {
      key: id,
      type: "repeatDetailList",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      props: {
        externalLabel: label,
        required: options?.required,
        titleField: options?.titleField,
        fields: options?.fields,
      },
      expressions: expressions,
      validators: options?.validators,
    };
  }

  private determinePlaceholder(options: RepeatListOptions) {
    let placeholder = options?.placeholder;
    if (!placeholder && options?.asSelect)
      placeholder = this.transloco.translate("form.placeholder.choose");
    if (!placeholder && options?.codelistId)
      placeholder = this.transloco.translate("form.placeholder.chooseOrEnter");
    if (!placeholder)
      placeholder = this.transloco.translate("form.placeholder.enter");
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
        placeholder:
          options?.placeholder ??
          this.transloco.translate("form.placeholder.chooseOrEnter"),
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
        buttonConfig: options?.buttonConfig,
        min: options?.min,
        max: options?.max,
        hintStart: options?.hintStart,
        keydown: options?.keydown,
        placeholder: options?.placeholder,
        hideInPreview: options?.hideInPreview ?? false,
        // [attributes] must be defined first for assigning values, e.g. aria-labelledby below.
        attributes: {},
      },
      modelOptions: {
        updateOn: options?.updateOn ?? "blur",
      },
      expressions: {
        ...expressions,
        "props.attributes.aria-labelledby": (field: FormlyFieldConfig) =>
          toAriaLabelledBy(field),
      },
      validation: options?.validation,
      validators: options?.validators,
      asyncValidators: options?.asyncValidators,
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
      type: "ige-select",
      className: options?.className,
      defaultValue: options?.defaultValue ?? null,
      wrappers:
        options?.wrappers === undefined
          ? ["panel", "form-field"]
          : options?.wrappers,
      props: {
        placeholder:
          options?.placeholder ??
          this.transloco.translate("form.placeholder.choose"),
        label: options?.fieldLabel,
        externalLabel: options?.externalLabel === null ? undefined : label,
        appearance: "outline",
        required: options?.required,
        options: options?.options,
        showSearch: options?.showSearch,
        allowNoValue: options?.allowNoValue ?? !options?.required,
        noValueLabel: options?.noValueLabel,
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
      defaultValue: options?.defaultValue,
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
        addonRight: options?.suffix,
        addonLeft: options?.prefix,
        hasInlineContextHelp: options?.hasInlineContextHelp,
        contextHelpId: options?.contextHelpId,
      },
      expressions: expressions,
      validators: options?.validators,
    };
  }

  addDatepickerInline(id, label, options: any = {}) {
    return this.addDatepicker(id, null, {
      fieldLabel: label,
      wrappers: options?.wrappers ?? ["form-field"],
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
        label: options?.fieldLabel,
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
    options?,
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
