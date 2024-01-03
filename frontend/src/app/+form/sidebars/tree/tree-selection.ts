/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { TreeNode } from "../../../store/tree/tree-node.model";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { EventEmitter } from "@angular/core";

export class TreeSelection {
  onSelectNodeByKeyboard = new EventEmitter<any>();

  model = new SelectionModel<TreeNode>(true);

  lastSelectedNode: TreeNode;

  multiSelectionModeEnabled = false;

  allowMultiSelectionMode = true;

  activeNode: TreeNode = null;

  constructor(private treeControl: FlatTreeControl<TreeNode>) {}

  /**
   *
   * @param node
   * @param $event
   */
  selectNode(node: TreeNode, $event?: MouseEvent) {
    if (!this.allowMultiSelectionMode) {
      return this.handleSingleSelection(node);
    }
    if (this.multiSelectionModeEnabled) {
      this.nodeSelectionToggle(node, $event);
    } else {
      if ($event?.ctrlKey) {
        this.model.toggle(node);
        this.multiSelectionModeEnabled = true;
        this.model.select(node);
        this.onSelectNodeByKeyboard.emit(this.multiSelectionModeEnabled);
        return;
      } else if ($event?.shiftKey) {
        this.lastSelectedNode = this.activeNode;
        this.multiSelectionModeEnabled = true;
        this.nodeSelectionToggle(node, $event);
        this.onSelectNodeByKeyboard.emit(this.multiSelectionModeEnabled);
        return;
      }
      const isUiEvent = $event !== undefined && $event !== null;
      return this.handleSingleSelection(node, isUiEvent);
    }
  }

  private handleSingleSelection(node: TreeNode, clickedOnNode = true) {
    // deselect all nodes first
    this.model.clear();
    this.model.select(node);
    this.activeNode = this.model.selected[0];

    if (clickedOnNode && this.treeControl.isExpandable(node)) {
      this.treeControl.toggle(node);
    }

    return this.model.selected[0]._id;
  }

  /** Toggle a leaf node selection */
  nodeSelectionToggle(
    node: TreeNode,
    $event: MouseEvent | MatCheckboxChange,
  ): void {
    // mark all nodes in between the last selected node
    if ($event instanceof MouseEvent && $event.shiftKey) {
      this.toggleNodesInBetween(node);
      return;
    }

    this.model.toggle(node);

    // do not remember node when shift key is used
    this.lastSelectedNode = this.determineLastSelectedNode(node);
  }

  private toggleNodesInBetween(node: TreeNode) {
    const nodeIndex = this.treeControl.dataNodes.indexOf(node);
    let startIndex = 0;

    if (this.lastSelectedNode) {
      startIndex = this.treeControl.dataNodes.indexOf(this.lastSelectedNode);
    }

    this.model.clear();

    if (startIndex < nodeIndex) {
      this.model.select(
        ...this.treeControl.dataNodes.slice(startIndex, nodeIndex + 1),
      );
    } else {
      this.model.select(
        ...this.treeControl.dataNodes.slice(nodeIndex, startIndex + 1),
      );
    }
  }

  /**
   * Last selected node is
   * - current, if it was activated
   * - or previous selected node
   * - or null, if there's no selection
   *
   * @param node
   * @private
   */
  private determineLastSelectedNode(node: TreeNode) {
    if (this.model.isSelected(node)) {
      return node;
    }

    if (this.model.isEmpty()) {
      return null;
    }

    return this.model.selected[this.model.selected.length - 1];
  }

  isSelected(node: TreeNode): boolean {
    return this.model.isSelected(node);
  }

  toggleSelectionMode(isEditMode: boolean) {
    this.multiSelectionModeEnabled = isEditMode;
    if (!this.multiSelectionModeEnabled) {
      this.model.clear();
      if (this.activeNode) {
        this.model.select(this.activeNode);
      }
    } else {
      if (this.activeNode) {
        this.lastSelectedNode = this.activeNode;
      }
    }
  }

  showFolderCheckbox(): boolean {
    return this.multiSelectionModeEnabled;
  }

  allNodesSelected() {
    return this.treeControl.dataNodes.every((node) =>
      this.model.isSelected(node),
    );
  }

  atLeastOneButNotAllNodesSelected() {
    return (
      this.treeControl.dataNodes.some((node) => this.model.isSelected(node)) &&
      !this.allNodesSelected()
    );
  }

  toggleAllSelection(checked: boolean) {
    checked
      ? this.model.select(...this.treeControl.dataNodes)
      : this.model.clear();

    this.lastSelectedNode = null;
  }
}
