import { FormlyFieldConfig } from "@ngx-formly/core";
import { Doctype } from "../app/services/formular/doctype";
import { merge, Observable } from "rxjs";
import {
  CodelistService,
  SelectOption,
} from "../app/services/codelist/codelist.service";
import { filter, map, take, tap } from "rxjs/operators";
import { CodelistQuery } from "../app/store/codelist/codelist.query";

export abstract class BaseDoctype implements Doctype {
  fields = <FormlyFieldConfig[]>[
    {
      key: "title",
      templateOptions: {
        label: "Titel",
      },
    },
    {
      key: "_id",
    },
    {
      key: "_parent",
    },
    {
      key: "_type",
      templateOptions: {
        label: "Typ",
      },
    },
    {
      key: "_created",
    },
    {
      key: "_modified",
      templateOptions: {
        label: "Aktualität",
      },
    },
    {
      key: "_version",
    },
  ];

  id: string;

  label: string;

  helpIds: string[];

  hasOptionalFields: boolean;

  fieldsMap: SelectOption[] = [];
  fieldWithCodelistMap: Map<string, string> = new Map<string, string>();

  constructor(
    private codelistService: CodelistService,
    private codelistQuery: CodelistQuery
  ) {}

  abstract documentFields(): FormlyFieldConfig[];

  getFields(): FormlyFieldConfig[] {
    return this.fields;
  }

  getCodelistForSelectWithEmtpyOption(
    codelistId: number,
    field: string
  ): Observable<SelectOption[]> {
    return this.getCodelistForSelect(codelistId, field).pipe(
      map((cl) => [{ label: "", value: undefined }].concat(cl))
    );
  }

  getCodelistForSelect(
    codelistId: number,
    field: string
  ): Observable<SelectOption[]> {
    if (field) this.fieldWithCodelistMap.set(field, codelistId + "");

    this.codelistService.byId(codelistId + "");

    return merge(
      this.codelistQuery.selectEntity(codelistId),
      this.codelistQuery
        .selectCatalogCodelist(codelistId + "")
        .pipe(tap(console.log))
    ).pipe(
      filter((codelist) => codelist),
      map((codelist) => CodelistService.mapToSelectSorted(codelist))
    );
  }

  init(help: string[]) {
    this.helpIds = help;
    this.fields.push(...this.documentFields());
    this.hasOptionalFields = this.hasOptionals(this.fields);
    this.addCodelistDefaultValues(this.fields);
    this.addContextHelp(this.fields);
    this.getFieldMap(this.fields);
    console.log("Profile initialized");
  }

  private hasOptionals(fields: FormlyFieldConfig[]): boolean {
    return fields.some((field) => {
      if (field.className && field.className.indexOf("optional") !== -1)
        return true;
      if (field.fieldGroup) {
        if (this.hasOptionals(field.fieldGroup)) return true;
      }
    });
  }

  private addContextHelp(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      let fieldKey = <string>field.key;
      if (field.fieldGroup) {
        this.addContextHelp(field.fieldGroup);
      }
      if (this.helpIds.indexOf(fieldKey) > -1) {
        if (!field.model?._type) field.templateOptions.docType = this.id;

        if (field.type === "checkbox") {
          field.templateOptions.hasInlineContextHelp = true;
        } else if (!field.templateOptions.hasInlineContextHelp) {
          field.templateOptions.hasContextHelp = true;
        }
      }
    });
  }

  private getFieldMap(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      let fieldKey = <string>field.key;
      if (field.fieldGroup) {
        this.getFieldMap(field.fieldGroup);
      }

      if (fieldKey) {
        this.fieldsMap.push({
          value: fieldKey,
          label:
            field.templateOptions?.externalLabel ||
            field.templateOptions?.label,
        });
      }
    });
  }

  private addCodelistDefaultValues(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      if (field.fieldGroup) {
        this.addCodelistDefaultValues(field.fieldGroup);
      }
      let codelistField = this.fieldWithCodelistMap.get(field.key as string);
      if (codelistField !== undefined) {
        this.codelistQuery
          .selectEntity(codelistField)
          .pipe(
            filter((codelist) => codelist !== undefined),
            take(1),
            filter((codelist) => codelist.default && codelist.default != "-1"),
            tap((codelist) => {
              console.log(
                `Setting default codelist value for: ${field.key} with: ${codelist.default}`
              );
              field.defaultValue =
                field.type === "select"
                  ? codelist.default
                  : codelist.entries.find(
                      (entry) => entry.id === codelist.default
                    ).fields["de"]; // FIXME: choose dynamic correct value or use codelist (needs changing of component)
            })
          )
          .subscribe();
      }
    });
  }
}
