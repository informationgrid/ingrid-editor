import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TreeNode } from '../models/tree-node.model';
import { TreeDraggedElement } from '../models/tree-dragged-element.model';

@Component({
  selector: 'TreeNodeDropSlot',
  encapsulation: ViewEncapsulation.None,
  styles: [
    '.node-drop-slot { display: block; height: 2px; width: 100%}',
    '.node-drop-slot.is-dragging-over { background: #ddffee; height: 20px; border: 2px dotted #888; }'
  ],
  template: `
    <div
      class="node-drop-slot"
      (treeDrop)="onDrop($event)"
      [treeAllowDrop]="allowDrop.bind(this)">
    </div>
  `
})
export class TreeNodeDropSlot {
  @Input() node: TreeNode;
  @Input() dropIndex: number;

  constructor() {
  }

  onDrop($event) {
    this.node.mouseAction('drop', $event.event, {
      from: $event.element,
      to: { parent: this.node, index: this.dropIndex }
    });
  }

  allowDrop(element) {
    return this.node.options.allowDrop(element, { parent: this.node, index: this.dropIndex });
  }
}
