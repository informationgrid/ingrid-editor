import {Injectable} from '@angular/core';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {FormToolbarService, Separator, ToolbarItem} from '../../form-shared/toolbar/form-toolbar.service';
import {TreeQuery} from '../../../store/tree/tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {filter} from 'rxjs/operators';
import {DocumentAbstract} from '../../../store/document/document.model';
import {TreeStore} from '../../../store/tree/tree.store';
import {ShortTreeNode} from '../../sidebars/tree/tree.types';

@UntilDestroy()
@Injectable()
export class HistoryPlugin extends Plugin {
  id = 'plugin.history';
  _name = 'History Plugin';
  defaultActive = true;

  private stack: DocumentAbstract[] = [];

  // maximum of nodes in stack
  maxSize = 20;

  // a pointer to show were we are in the history stack
  pointer = -1;

  // when loading a node by back-Button, we don't want to add it to the stack!
  ignoreNextPush = false;

  // the popup showing the last/next nodes
  popupMenu = null;

  constructor(private formToolbarService: FormToolbarService,
              private treeStore: TreeStore,
              private treeQuery: TreeQuery) {
    super();
  }

  get name() {
    return this._name;
  }

  register() {
    super.register();

    this.addToolbarButtons();

    this.handleEvents();

    this.treeQuery.openedDocument$
      .pipe(
        untilDestroyed(this),
        filter(doc => doc !== null)
      )
      .subscribe(doc => this.addDocToStack(doc));

  };


  private addDocToStack(doc: DocumentAbstract) {

    if (this.ignoreNextPush) {
      this.ignoreNextPush = false;
      return;
    }

    // if the last node was loaded again -> ignore
    if (this.stack.length !== 0 && doc.id === this.stack[this.stack.length - 1].id) {
      return;
    }

    // remove everything after the pointer to discard nodes from history, when we came back
    this.stack.splice(this.pointer + 1);

    this.stack.push(doc);

    // if stack gets too big, then remove first item
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    } else {
      this.pointer++;
    }

    // this.stack$.next(this.stack);
    this.handleButtonState();
  }

  private handleEvents() {
    // react on event when button is clicked
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'HISTORY_NEXT') {
        this.handleNext();
      } else if (eventId === 'HISTORY_PREVIOUS') {
        this.handlePrevious();
      }
    });

    /*
        this.stack$
          .pipe(untilDestroyed(this))
          .subscribe(stack => this.handleButtonState(stack));
    */

  }

  private addToolbarButtons() {
    const buttons: Array<ToolbarItem | Separator> = [
      {id: 'toolBtnNewSeparator', pos: 190, isSeparator: true},
      {
        id: 'toolBtnPreviousInHistory',
        tooltip: 'Springe zum letzten Dokument',
        matSvgVariable: 'Vorheriger-Datensatz',
        eventId: 'HISTORY_PREVIOUS',
        pos: 200,
        active: false
      },
      {
        id: 'toolBtnNextInHistory',
        tooltip: 'Springe zum nächsten Dokument',
        matSvgVariable: 'Naechster-Datensatz',
        eventId: 'HISTORY_NEXT',
        pos: 210,
        active: false
      }
    ];
    buttons.forEach((button) => this.formToolbarService.addButton(button));
  }

  unregister() {
    super.unregister();
  }

  private handleNext() {

    // prevent too fast clicks
    if (this.ignoreNextPush) {
      return;
    }

    // in case of a long press this shall not be executed
    // if (evt.ignore) { return; }

    // close the popup if it's still open
    // popup.close(this.popupMenu);

    const node = this.stack[this.pointer + 1];
    this.ignoreNextPush = true;
    if (this.hasNext()) {
      this.pointer++;
    }
    this.gotoNode(node);
    this.handleButtonState();
  }

  private handlePrevious() {

    // prevent too fast clicks
    if (this.ignoreNextPush) {
      return;
    }

    // in case of a long press this shall not be executed
    // if (evt.ignore) { return; }

    // close the popup if it's still open
    // popup.close(this.popupMenu);

    const node = this.stack[this.pointer - 1];
    this.ignoreNextPush = true;
    if (this.pointer > 0) {
      this.pointer--;
    }
    this.gotoNode(node);
    this.handleButtonState();
  }

  private hasNext() {
    return this.pointer < (this.stack.length - 1);
  }

  private hasPrevious() {
    return this.pointer > 0;
  }

  private gotoNode(item: DocumentAbstract) {
    this.treeStore.update({
      explicitActiveNode: new ShortTreeNode(item.id.toString(), item.title)
    });
  }

  private handleButtonState() {
    this.formToolbarService.setButtonState('toolBtnPreviousInHistory', this.hasPrevious());
    this.formToolbarService.setButtonState('toolBtnNextInHistory', this.hasNext());
  }
}
