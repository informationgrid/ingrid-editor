import { DocMainInfo } from '../../../models/update-dataset-info.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators';
import { merge } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DynamicFlatNode } from './DynamicFlatNode';
import { DynamicDatabase } from './DynamicDatabase';
import { ProfileService } from '../../../services/profile.service';
import { FormularService } from '../../../services/formular/formular.service';

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class DynamicDataSource {

  dataChange: BehaviorSubject<DynamicFlatNode[]> = new BehaviorSubject<DynamicFlatNode[]>( [] );

  cachedChildren: any = {};

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }

  set data(value: DynamicFlatNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next( value );
  }

  constructor(private treeControl: FlatTreeControl<DynamicFlatNode>,
              private database: DynamicDatabase, private formularService: FormularService) {
  }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this.treeControl.expansionModel.changed!.subscribe( change => {
      if ((change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed) {
        this.handleTreeControl( change as SelectionChange<DynamicFlatNode> );
      }
    } );

    return merge( collectionViewer.viewChange, this.dataChange ).pipe( map( () => this.data ) );
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach( (node) => this.toggleNode( node, true ) );
    }
    if (change.removed) {
      change.removed.reverse().forEach( (node) => this.toggleNode( node, false ) );
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean): Promise<any> {

    return new Promise( resolve => {

      if (expand) {

        // if node was loaded before, just add it to the data array
        if (this.cachedChildren[node.id]) {
          this.data.splice( this.data.indexOf( node ) + 1, 0, ...this.cachedChildren[node.id] );
          this.dataChange.next( this.data );
          resolve();

        } else { // if node wasn't loaded yet
          node.isLoading = true;

          this.database.getChildren( node.id ).then( children => {
            const index = this.data.indexOf( node );
            if (!children || index < 0) { // If no children, or cannot find the node, no op
              return;
            }

            const nodes = children.map( child => this.mapDynamicFlatNode( node.level + 1, child ) );
            this.data.splice( index + 1, 0, ...nodes );
            node.isLoading = false;
            this.cachedChildren[node.id] = nodes;
            this.dataChange.next( this.data );
            resolve();
          } );
        }

      } else { // collapse

        this.data.splice( this.data.indexOf( node ) + 1, this.cachedChildren[node.id].length );
        this.dataChange.next( this.data );
        resolve();
      }

    } );
  }

  private mapDynamicFlatNode(level: number, child: DocMainInfo): DynamicFlatNode {
    const label = this.formularService.getTitle(child._profile, child);
    return new DynamicFlatNode( child._id, label, child._profile, child._state, level,
      this.database.isExpandable( child ), child.icon );
  }

  addChildNode(parentId: string, doc: DocMainInfo) {
    const index = this.data.findIndex( item => item.id === parentId );
    const parentNode = this.data[index];
    const newNode = this.mapDynamicFlatNode(
      parentNode ? parentNode.level + 1 : 0,
      doc );
    this.data.splice( index + 1, 0, newNode );

    if (parentNode) {
      if (!this.cachedChildren[parentNode.id]) {
        this.cachedChildren[parentNode.id] = [];
      }
      this.cachedChildren[parentNode.id].push(newNode);
    }
    this.dataChange.next(this.data);
  }

  removeNode(nodeId: string) {
    const index = this.data.findIndex( item => item.id === nodeId );

    const parentNode = this.getParentNode(nodeId);
    const childIndex = (<DynamicFlatNode[]>this.cachedChildren[parentNode.id]).findIndex( child => child === this.data[index]);

    this.cachedChildren[parentNode.id].splice(childIndex, 1);
    this.data.splice( index, 1 );

    this.dataChange.next( this.data );

  }

  reload(): Promise<any> {
    this.cachedChildren = {};
    this.data = [];

    return this.database.initialData().then( rootNodes => this.data = rootNodes );
  }

  updateNode(nodeId: string, doc: DocMainInfo) {
    const index = this.data.findIndex( item => item.id === nodeId );

    const updatedNode = this.mapDynamicFlatNode( this.data[index].level, doc );
    this.data.splice( index, 1, updatedNode );
    this.dataChange.next( this.data );
  }

  private getParentNode(nodeId: string): DynamicFlatNode {
    let index = this.data.findIndex( item => item.id === nodeId );
    const nodeLevel = this.data[index].level;

    while (--index >= 0) {
      if (this.data[index].level === nodeLevel - 1) {
        return this.data[index];
      }
    }

    return null;
  }
}
