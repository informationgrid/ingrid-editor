import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subject } from "rxjs";
import { MatListOption, MatSelectionListChange } from "@angular/material/list";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";

@Component({
  selector: "ige-tree-permission",
  templateUrl: "./tree-permission.component.html",
  styleUrls: ["./tree-permission.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreePermissionComponent),
      multi: true,
    },
  ],
})
export class TreePermissionComponent implements ControlValueAccessor {
  @Input() address = false;

  val = [];
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};
  selection: string[] = [];
  activeNodeSetter = new Subject();
  selectedGroup: string;
  groups: any[];

  disableTreeNodes = (node: TreeNode) => {
    return this.val.some((v) => v.uuid === node._id);
  };

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
    private addressTreeQuery: AddressTreeQuery
  ) {}

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
    const query = this.address ? this.addressTreeQuery : this.treeQuery;
    const entity = query.getEntity(this.selection[0]);

    this.value = [
      ...this.val,
      { uuid: this.selection[0], title: entity.title, permission: option },
    ];
    this.activeNodeSetter.next(null);
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
