import { Component } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import {
  ChipDialogComponent,
  ChipDialogData,
} from "./chip-dialog/chip-dialog.component";
import { UntypedFormControl } from "@angular/forms";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";

@Component({
  selector: "ige-repeat-chip",
  templateUrl: "./repeat-chip.component.html",
  styleUrls: ["./repeat-chip.component.scss"],
})
export class RepeatChipComponent extends FieldArrayType {
  inputControl = new UntypedFormControl();

  constructor(private dialog: MatDialog) {
    super();

    // show error immediately (on publish)
    this.inputControl.setValue("");
    this.inputControl.markAllAsTouched();
  }

  openDialog() {
    this.dialog
      .open(ChipDialogComponent, {
        data: <ChipDialogData>{
          options: this.props.options,
          model: this.model,
        },
        hasBackdrop: true,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          this.addValuesFromResponse(response);
          this.removeDeselectedValues(response);
        }
      });
  }

  private addValuesFromResponse(response) {
    response.forEach((item) =>
      !this.model || this.model.indexOf(item) === -1
        ? this.add(null, item)
        : null
    );
  }

  /**
   * Remove items not coming from dialog
   * @param response
   */
  private removeDeselectedValues(response) {
    let i = 0;
    while (i < this.model.length) {
      if (response.indexOf(this.model[i]) === -1) {
        this.remove(i);
        // do not increment i, since remove operation manipulates model
      } else {
        i++;
      }
    }
  }

  addValues(value: string) {
    let duplicates = [];
    value.split(",").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed == "") return;

      if (this.model.indexOf(trimmed) === -1) {
        this.add(null, trimmed);
      } else {
        if (duplicates.indexOf(trimmed) == -1) duplicates.push(trimmed);
      }
    });
    this.inputControl.setValue("");
    if (duplicates.length > 0) {
      duplicates = duplicates.map((dup) => "'" + dup + "'");
      var formatedDuplicates = "";
      if (duplicates.length == 1) {
        formatedDuplicates = duplicates[0];
      } else {
        formatedDuplicates = duplicates
          .join(", ")
          .replace(/,([^,]*)$/, " und$1");
      }
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: "Bitte beachten",
          message:
            "Die Eingabe von " +
            formatedDuplicates +
            " erfolgte mehrfach, wurde aber nur einmal übernommen.",
          buttons: [{ text: "Ok", alignRight: true, emphasize: true }],
        } as ConfirmDialogData,
      });
    }
  }

  drop(event: { previousIndex: number; currentIndex: number }) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }
}
