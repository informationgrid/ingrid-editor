import {Injectable} from '@angular/core';
import {Plugin} from '../../plugin';
import {EventData, EventResponseHandler, EventService, IgeEvent, IgeEventResultType} from '../../../services/event/event.service';
import {TreeQuery} from '../../../store/tree/tree.query';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {ModalService} from '../../../services/modal/modal.service';
import {IgeError} from '../../../models/ige-error';

@Injectable({
  providedIn: 'root'
})
export class DeleteEmptyFoldersBehaviour extends Plugin {

  id = 'plugin.delete.empty.folders';
  name = 'Nur leere Ordner löschen';
  description = 'Es dürfen nur leere Ordner gelöscht werden';
  defaultActive = true;


  constructor(private modal: ModalService,
              private eventService: EventService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery) {
    super();
  }

  register() {

    console.log('Register Delete empty folder behaviour');
    super.register();

    this.subscriptions.push(
      this.eventService.respondToEvent(IgeEvent.DELETE)
        .subscribe(resultObserver => this.handleEvent(resultObserver))
    );
  }

  private handleEvent(resultObserver: EventResponseHandler) {

    let success = true;

    if (this.currentDocHasChildren()) {
      // TODO: improve error generation
      const error = new IgeError();
      error.setMessage('Um den Ordner zu löschen, muss dieser leer sein');
      this.modal.showIgeError(error);
      success = false;
    }

    const responseData = this.buildResponse(success);
    resultObserver(responseData);
  }

  private currentDocHasChildren() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    // TODO: refactor openedDocument in store to another one, since it's of different format
    //       and not directly associated with tree-store
    const docId = query.getOpenedDocument().id;
    return query.getEntity(docId)._hasChildren;
  }

  private buildResponse(isSuccess: boolean): EventData {

    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess ? null : 'this info comes from delete empty folder behaviour'
    };

  }
}
