import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  CodelistService,
  SelectOption,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter } from "rxjs/operators";
import { BackendOption } from "../../../app/store/codelist/codelist.model";

export interface FormType {
  specification: FormControl<SelectOptionUi>;
  pass: FormControl<SelectOptionUi>;
  date: FormControl<string>;
  verifiedBy: FormControl<string>;
  isInspire: FormControl<boolean>;
}

@UntilDestroy()
@Component({
  selector: "ige-conformity-dialog",
  templateUrl: "./conformity-dialog.component.html",
})
export class ConformityDialogComponent implements OnInit {
  specifications = this.codelistService.observe("6005");
  specificationsFree = this.codelistService.observe("6006");
  level = this.codelistService.observe("6000");
  form: FormGroup<FormType>;

  displayFn(option: SelectOptionUi): string {
    return option && option.label ? option.label : "";
  }

  selectFn(option: SelectOptionUi, value: SelectOptionUi): boolean {
    return option?.value === value?.value;
  }

  constructor(
    private dlgRef: MatDialogRef<any>,
    fb: FormBuilder,
    private codelistService: CodelistService,
    private codelistQuery: CodelistQuery,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    const model = this.data.model;
    const isInspire = model?.isInspire ?? true;
    const specification = this.prepareSpecification(
      isInspire,
      model?.specification,
    );
    this.form = fb.group({
      specification: fb.control(specification, Validators.required),
      pass: fb.control(
        SelectOption.fromBackend(model?.pass),
        Validators.required,
      ),
      date: fb.control(
        { value: model?.publicationDate, disabled: isInspire },
        Validators.required,
      ),
      verifiedBy: fb.control(model?.explanation),
      isInspire: fb.control(isInspire),
    });
  }

  ngOnInit(): void {
    this.handleSpecificationChange();
    this.handleInspireChange();
  }

  private handleInspireChange() {
    this.form
      .get("isInspire")
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((checked) => {
        const dateField = this.form.controls.date;
        checked ? dateField.disable() : dateField.enable();
        dateField.reset();
        this.form.controls.specification.reset();
      });
  }

  private handleSpecificationChange() {
    this.form
      .get("specification")
      .valueChanges.pipe(
        untilDestroyed(this),
        filter((option) => option !== null),
      )
      .subscribe((option) => {
        const codelistId =
          this.form.get("isInspire").value === true ? "6005" : "6006";
        const codelistEntry = this.codelistQuery.getCodelistEntryByKey(
          codelistId,
          option.value,
        );
        if (codelistEntry) {
          try {
            const date = new Date(codelistEntry.data.replaceAll("-", "/"));
            this.form.get("date").setValue(date.toISOString());
          } catch (error) {
            console.warn(error);
          }
        }
      });
  }

  submit() {
    const value = this.form.getRawValue();

    const isObject = value.specification instanceof Object;
    this.dlgRef.close({
      specification: new SelectOption(
        value.specification.value,
        // @ts-ignore
        isObject ? value.specification.label : value.specification,
      ).forBackend(),
      pass: new SelectOption(value.pass.value, value.pass.value).forBackend(),
      publicationDate: value.date,
      explanation: value.verifiedBy,
      isInspire: value.isInspire,
    });
  }

  private prepareSpecification(
    isInspire: boolean,
    specification: BackendOption,
  ): SelectOption {
    const option = SelectOption.fromBackend(specification);
    if (!isInspire && option.value)
      option.label = this.codelistQuery.getCodelistEntryValueByKey(
        "6006",
        option.value,
      );
    return option;
  }
}
