import {
  AfterViewInit,
  Component,
  forwardRef,
  Input,
  OnInit
} from "@angular/core";
import { PermissionLevel, TreePermission } from "../../user";
import { MatTableDataSource } from "@angular/material/table";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AddressRef } from "../../../formly/types/address-type/address-card/address-card.component";
import { ChooseAddressDialogComponent } from "../../../formly/types/address-type/choose-address-dialog/choose-address-dialog.component";
import { filter } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { PermissionAddDialogComponent } from "../permission-add-dialog/permission-add-dialog.component";
import { fa } from "cronstrue/dist/i18n/locales/fa";
import { MatListOption } from "@angular/material/list";
import { ConfirmDialogComponent, ConfirmDialogData } from "../../../dialogs/confirm/confirm-dialog.component";

@Component({
  selector: "permission-table",
  templateUrl: "./permission-table.component.html",
  styleUrls: ["./permission-table.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionTableComponent),
      multi: true
    }
  ]
})
export class PermissionTableComponent implements ControlValueAccessor {
  @Input() title: string;
  @Input() forAddress = false;

  public permissionLevel: typeof PermissionLevel = PermissionLevel;

  displayedColumns: string[] = ["title", "permission", "settings"];

  val = [];
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};

  constructor(private dialog: MatDialog) {
  }

  callEditDialog() {
    return this.dialog
      .open(PermissionAddDialogComponent, {
        minWidth: 500,
        data: { forAddress: this.forAddress, value: this.value }

      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.value = [
            ...this.val,
            data
          ];
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
              emphasize: true
            }
          ]
        }
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
    if (this.onChange) {
      this.onChange(val);
    }
    if (this.onTouch) {
      this.onTouch(val);
    }
  }
}
