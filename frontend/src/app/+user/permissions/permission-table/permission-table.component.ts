import { Component, forwardRef, Input } from "@angular/core";
import { PermissionLevel, TreePermission } from "../../user";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PermissionAddDialogComponent } from "../permission-add-dialog/permission-add-dialog.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { DynamicDatabase } from "../../../+form/sidebars/tree/dynamic.database";
import { DocumentService } from "../../../services/document/document.service";
import { map } from "rxjs/operators";
import { ShortTreeNode } from "../../../+form/sidebars/tree/tree.types";
import { IgeDocument } from "../../../models/ige-document";

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
  @Input() label: string;
  @Input() forAddress = false;

  public permissionLevel: typeof PermissionLevel = PermissionLevel;

  displayedColumns: string[] = ["type-icon", "title", "permission", "settings"];

  val: TreePermission[] = [];
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};
  breadcrumb: { [x: string]: ShortTreeNode[] } = {};

  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService
  ) {}

  callAddPermissionDialog() {
    return this.dialog
      .open(PermissionAddDialogComponent, {
        minWidth: 500,
        hasBackdrop: true,
        data: {
          forAddress: this.forAddress,
          value: this.val,
          breadcrumb: this.breadcrumb,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.value = data;
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
    this.value = this.val.filter((entry) => uuid !== entry.id);
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

  set value(val: TreePermission[]) {
    this.val = val ?? [];
    this.val.forEach((doc) => {
      if (!this.breadcrumb[doc.id]) {
        this.documentService
          .getPath(doc.id)
          .subscribe((path) => (this.breadcrumb[doc.id] = path.slice(0, -1)));
      }
      // if not initialized
      if (
        doc.isFolder === undefined ||
        doc.hasWritePermission === undefined ||
        doc.hasOnlySubtreeWritePermission === undefined
      ) {
        this.getDocument(doc.id).then((igeDoc) => {
          doc.hasWritePermission = igeDoc.hasWritePermission;
          doc.hasOnlySubtreeWritePermission =
            igeDoc.hasOnlySubtreeWritePermission;
          doc.isFolder = igeDoc._type === "FOLDER";

          // downgrade permission if rights are not sufficient
          this.adjustPermission(doc);
        });
      }

      console.log(doc);
    });
    if (this.onChange) {
      this.onChange(val);
    }
    if (this.onTouch) {
      this.onTouch(val);
    }
  }

  getDocument(id: string): Promise<IgeDocument> {
    return this.documentService.load(id, this.forAddress).toPromise();
  }

  getIcon(element) {
    if (element.isFolder) {
      return "Ordner";
    } else if (this.forAddress) {
      return "Freie-Adresse";
    } else {
      return "Fachaufgabe";
    }
  }

  updatePermission(element, level: PermissionLevel) {
    element.permission = level;
    this.onChange(this.val);
  }

  private adjustPermission(doc: any) {
    console.log("permissions", doc.permission);
    // all permissions are allowed
    if (doc.hasWritePermission) return;

    // adjust permission if only subtree rights are available and permission was WRITE
    if (
      doc.hasOnlySubtreeWritePermission &&
      doc.permission === PermissionLevel.WRITE
    ) {
      console.log("adjusting permission");
      doc.permission = PermissionLevel.WRITE_EXCEPT_PARENT;
    }

    //only read permission is allowed
    if (!doc.hasWritePermission && !doc.hasOnlySubtreeWritePermission) {
      doc.permission = PermissionLevel.READ;
    }
  }
}
