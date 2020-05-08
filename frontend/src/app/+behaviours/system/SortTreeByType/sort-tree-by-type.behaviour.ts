import {Injectable} from '@angular/core';
import {Plugin} from '../../plugin';
import {Subscription} from 'rxjs';
import {TreeService, TreeSortFn} from '../../../+form/sidebars/tree/tree.service';
import {TreeNode} from '../../../store/tree/tree-node.model';

@Injectable({
  providedIn: 'root'
})
export class SortTreeByTypeBehaviour extends Plugin {
  id = 'plugin.sort.tree.by.type';
  _name = 'Sortierung des Baums nach Dokumententyp';
  defaultActive = false;

  description = 'Anstatt die Baumknoten nach dem Titel zu sortieren, werden diese' +
    'nach dem Dokumenttyp sortiert. Verzeichnisse erscheinen weiterhin als erstes.';
  subscription: Subscription;

  private sortByDocumentType: TreeSortFn = (a: TreeNode, b: TreeNode) => {
    // folders first
    if (a.profile === 'FOLDER' && b.profile !== 'FOLDER') {
      return -1;
    } else if (a.profile !== 'FOLDER' && b.profile === 'FOLDER') {
      return 1;
    } else {
      return a.profile.localeCompare(b.profile);
    }
  };

  get name() {
    return this._name;
  }

  constructor(private treeService: TreeService) {
    super();
  }

  register() {
    super.register();

    this.treeService.registerTreeSortFunction(this.sortByDocumentType);
  }

  unregister() {
    super.unregister();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
