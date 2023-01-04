import { Component, forwardRef, Input } from "@angular/core";
import { PermissionLevel, TreePermission } from "../../user";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { PermissionAddDialogComponent } from "../permission-add-dialog/permission-add-dialog.component";
import { DynamicDatabase } from "../../../+form/sidebars/tree/dynamic.database";
import { DocumentService } from "../../../services/document/document.service";
import { ShortTreeNode } from "../../../+form/sidebars/tree/tree.types";
import { IgeDocument } from "../../../models/ige-document";
import { ProfileService } from "../../../services/profile.service";

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
  @Input() disabled = false;

  public permissionLevel: typeof PermissionLevel = PermissionLevel;

  displayedColumns: string[] = ["type-icon", "title", "permission", "settings"];

  val: TreePermission[] = [];
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};
  breadcrumb: { [x: string]: ShortTreeNode[] } = {};

  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService,
    private profileService: ProfileService
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
          this.val = [...this.val, data];
          this.addDocInfoToPermission(data);
          this.onChange(this.val);
        }
      });
  }

  removePermission(id: string) {
    this.value = this.val.filter((entry) => id !== entry.id);
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
    this.val.forEach((doc) => this.addDocInfoToPermission(doc));

    if (this.onChange) {
      this.onChange(val);
    }
    if (this.onTouch) {
      this.onTouch(val);
    }
  }

  private addDocInfoToPermission(doc: TreePermission) {
    // if root permission skip
    if (doc.id == null) return;

    if (!this.breadcrumb[doc.id]) {
      this.documentService
        .getPath(doc.id)
        .subscribe((path) => (this.breadcrumb[doc.id] = path.slice(0, -1)));
    }

    this.getDocument(doc.id).then((igeDoc) => {
      doc.hasWritePermission = igeDoc.hasWritePermission;
      doc.hasOnlySubtreeWritePermission = igeDoc.hasOnlySubtreeWritePermission;
      // Organisations act like folders in this context and also have the hasOnlySubtreeWritePermission option
      doc.isFolder =
        igeDoc._type === "FOLDER" || igeDoc._type.endsWith("OrganisationDoc");
      doc.title = igeDoc.title;
      doc.iconClass = this.profileService.getProfile(igeDoc._type).iconClass;

      // downgrade permission if rights are not sufficient
      this.adjustPermission(doc);
    });
  }

  getDocument(id: string): Promise<IgeDocument> {
    return this.documentService.load(id, this.forAddress, false).toPromise();
  }

  updatePermission(element, level: PermissionLevel) {
    if (this.disabled) return;
    element.permission = level;
    this.onChange(this.val);
  }

  private adjustPermission(doc: any) {
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
