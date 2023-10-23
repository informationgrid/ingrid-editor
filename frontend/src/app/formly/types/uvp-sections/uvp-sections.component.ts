import { Component, OnInit } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { debounceTime, filter, map, startWith } from "rxjs/operators";
import { FormularService } from "../../../+form/formular.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-uvp-sections",
  templateUrl: "./uvp-sections.component.html",
  styleUrls: ["./uvp-sections.component.scss"],
})
export class UvpSectionsComponent extends FieldArrayType implements OnInit {
  markSection = {};
  sectionTypes = [];

  constructor(
    private dialog: MatDialog,
    private formService: FormularService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(100),
        startWith(this.formControl.value),
        map((values) => this.getLabelFromSections(values)),
      )
      .subscribe((value) => this.formService.setAdditionalSections(value));

    this.sectionTypes = (<FormlyFieldConfig>this.field.fieldArray).fieldGroup;
  }

  private getLabelFromSections(values: FormlyFieldConfig[]) {
    return values
      .map((value) =>
        (<FormlyFieldConfig>this.field.fieldArray).fieldGroup.find(
          (item) => item.name === value.type,
        ),
      )
      .map((value) => value?.props?.label);
  }

  removeSection(index: number) {
    this.dialog
      .open(ConfirmDialogComponent, {
        autoFocus: "first-tabbable",
        hasBackdrop: true,
        data: <ConfirmDialogData>{
          title: "Schritt entfernen",
          message: "Wollen Sie den Schritt wirklich entfernen?",
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe(() => this.remove(index));
  }

  addSection(name: string) {
    this.add(null, { type: name });
  }
}
