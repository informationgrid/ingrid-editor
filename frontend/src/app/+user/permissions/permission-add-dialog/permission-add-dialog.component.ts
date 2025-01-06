/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, inject, Inject, Input, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { TreeNode } from "../../../store/tree/tree-node.model";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { map } from "rxjs/operators";
import { TreePermission } from "../../user";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TreeComponent } from "../../../+form/sidebars/tree/tree.component";
import { AddressTreeStore } from "../../../store/address-tree/address-tree.store";
import { TreeStore } from "../../../store/tree/tree.store";

@Component({
  selector: "permission-add-dialog",
  templateUrl: "./permission-add-dialog.component.html",
  styleUrls: ["./permission-add-dialog.component.scss"],
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle,
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    TreeComponent,
    MatDialogActions,
    MatButton,
  ],
})
export class PermissionAddDialogComponent implements OnInit {
  @Input() forAddress = this.data?.forAddress;

  private documentTreeStore = inject(TreeStore);
  private addressTreeStore = inject(AddressTreeStore);

  val: TreePermission[] = [];
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};
  selection: number[] = [];
  activeNodeSetter = new Subject();

  disableTreeNodes = (node: TreeNode) => {
    return this.val.some((v) => v.id === node._id);
  };

  isExpandable = (node: TreeNode) =>
    !this.val.some((v) => v.id === node._id) && node.hasChildren;

  set value(val) {
    this.val = val ?? [];
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PermissionAddDialogComponent>,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.value = this.data?.value ?? [];
  }

  addPermission(option: string) {
    const store = this.forAddress
      ? this.addressTreeStore
      : this.documentTreeStore;
    const entity = store.entityMap()[this.selection[0]];
    const idToAdd = this.selection[0];

    // check if permission is an ancestor of an existing permission
    let descendants = [];
    this.val.forEach((permission) => {
      this.data?.breadcrumb[permission.id]?.forEach((crumb) => {
        if (idToAdd === crumb.id) descendants.push(permission);
      });
    });

    if (descendants.length) {
      this.openConfirmPermissionUpdateDialog(descendants).subscribe(
        (confirmed) => (confirmed ? this.addPermission(option) : undefined),
      );
    } else {
      this.dialogRef.close({
        id: idToAdd,
        title: entity.title,
        permission: option,
      });
    }
  }

  openConfirmPermissionUpdateDialog(
    descendants: TreePermission[],
  ): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: (<ConfirmDialogData>{
          title: "Rechte ändern",
          message: "Achtung! Überschreibt folgende Unterrechte:",
          list: descendants.map((d) => d.title),
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Rechte ändern",
              id: "confirm",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(
        map((response) => {
          if (response === "confirm") {
            this.value = this.val.filter(
              (p) => !descendants.map((d) => d.id).includes(p.id),
            );
            return true;
          } else {
            return false;
          }
        }),
      );
  }

  shouldDisableAddButton() {
    return (
      this.selection.length === 0 ||
      this.val.some((item) => item.id === this.selection[0])
    );
  }
}
