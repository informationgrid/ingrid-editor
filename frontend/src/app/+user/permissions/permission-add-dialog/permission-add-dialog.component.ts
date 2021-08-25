import { Component, forwardRef, Inject, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subject } from "rxjs";
import { MatListOption, MatSelectionListChange } from "@angular/material/list";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "permission-add-dialog",
  templateUrl: "./permission-add-dialog.component.html",
  styleUrls: ["./permission-add-dialog.component.scss"],
})
export class PermissionAddDialogComponent implements OnInit {
  @Input() forAddress = this.data?.forAddress;

  val = [];
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};
  selection: string[] = [];
  activeNodeSetter = new Subject();

  disableTreeNodes = (node: TreeNode) => {
    return this.val.some((v) => v.uuid === node._id);
  };

  isExpandable = (node: TreeNode) =>
    !this.val.some((v) => v.uuid === node._id) && node.hasChildren;

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

  constructor(
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PermissionAddDialogComponent>
  ) {
    this.value = this.data?.value ?? [];
  }

  ngOnInit(): void {
    this.value = this.data?.value ?? [];
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

  addPermission(option: string) {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    const entity = query.getEntity(this.selection[0]);
    this.dialogRef.close({
      uuid: this.selection[0],
      title: entity.title,
      permission: option,
    });
  }

  jumpToTreeNode($event: MatSelectionListChange) {
    this.activeNodeSetter.next($event.options[0].value);
  }

  shouldDisableAddButton() {
    return (
      this.selection.length === 0 ||
      this.val.some((item) => item.uuid === this.selection[0])
    );
  }

  removePermission(item: MatListOption) {
    this.value = this.val.filter((entry) => item.value !== entry.uuid);
    this.activeNodeSetter.next(null);
  }
}
