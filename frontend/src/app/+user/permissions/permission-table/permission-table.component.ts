import { Component, forwardRef, Input } from "@angular/core";
import { PermissionLevel } from "../../user";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PermissionAddDialogComponent } from "../permission-add-dialog/permission-add-dialog.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { DynamicDatabase } from "../../../+form/sidebars/tree/dynamic.database";

@Component({
  selector: "permission-table",
  templateUrl: "./permission-table.component.html",
  styleUrls: ["./permission-table.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionTableComponent),
      multi: true,
    },
    DynamicDatabase,
  ],
})
export class PermissionTableComponent implements ControlValueAccessor {
  @Input() title: string;
  @Input() forAddress = false;

  public permissionLevel: typeof PermissionLevel = PermissionLevel;

  displayedColumns: string[] = ["title", "permission", "settings"];

  val = [];
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};

  constructor(private dialog: MatDialog, private database: DynamicDatabase) {}

  callAddPermissionDialog() {
    return this.dialog
      .open(PermissionAddDialogComponent, {
        minWidth: 500,
        data: { forAddress: this.forAddress, value: this.value },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.value = [...this.val, data];
        }
      });
  }

  callRemovePermissionDialog(uuid: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie die Berechtigung wirklich löschen?`,
          title: "Löschen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        this.removePermission(uuid);
      });
  }

  private removePermission(uuid: string) {
    this.value = this.val.filter((entry) => uuid !== entry.uuid);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  set value(val) {
    // TODO: fetch titles from tree nodes
    this.val = val ?? [];
    this.val.forEach((doc) => {
      if (!doc.path) this.getPath(doc.uuid).then((path) => (doc.path = path));
    });
    if (this.onChange) {
      this.onChange(val);
    }
    if (this.onTouch) {
      this.onTouch(val);
    }
  }

  getPath(uuid: string): Promise<string> {
    return this.database.getPath(uuid).then((path) => path.join(" > "));
  }
}
