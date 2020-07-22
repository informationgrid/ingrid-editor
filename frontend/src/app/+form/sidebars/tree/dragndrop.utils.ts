import {TreeNode} from '../../../store/tree/tree-node.model';
import {TreeControl} from '@angular/cdk/tree';

export interface DropInfo {
  allow: boolean;
  srcNode?: TreeNode
}

export class DragNDropUtils {


  dragNodeExpandOverNode: TreeNode;
  private dragNodeExpandOverTime: number;
  private dragNodeExpandOverWaitTimeMs = 1000;
  private dragNode: TreeNode;


  constructor(private treeControl: TreeControl<any>) {

  }

  /**
   * See here for example: https://stackblitz.com/edit/angular-draggable-mat-tree
   * @param event
   * @param droppedNode
   */
  getDropInfo(droppedNode: TreeNode): DropInfo {
    if (droppedNode !== this.dragNode) {
      return {
        allow: true,
        srcNode: this.dragNode
      }
    } else {
      return {
        allow: false
      }
    }
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer.setData('foo', 'bar');
    // event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();

    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }
    /*
        // Handle drag area
        const percentageX = event.offsetX / event.target.clientWidth;
        const percentageY = event.offsetY / event.target.clientHeight;
        if (percentageY < 0.25) {
          this.dragNodeExpandOverArea = 'above';
        } else if (percentageY > 0.75) {
          this.dragNodeExpandOverArea = 'below';
        } else {
          this.dragNodeExpandOverArea = 'center';
        }*/
  }

  handleDragEnd() {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

}
