import {Injectable} from '@angular/core';
import {Plugin} from '../../plugin';
import {EventData, EventResponseHandler, EventService, IgeEvent, IgeEventResultType} from '../../../../services/event/event.service';
import {TreeQuery} from '../../../../store/tree/tree.query';
import {AddressTreeQuery} from '../../../../store/address-tree/address-tree.query';
import {ModalService} from '../../../../services/modal/modal.service';
import {IgeError} from '../../../../models/ige-error';
import {filter, map, take} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

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

    this.currentDocHasChildren()
      .subscribe(hasChildren => {
        if (hasChildren) {
          // TODO: improve error generation
          const error = new IgeError();
          error.setMessage('Um den Ordner zu löschen, muss dieser leer sein');
          this.modal.showIgeError(error);
          success = false;
        }
        const responseData = this.buildResponse(success);
        resultObserver(responseData);

      });
  }

  private currentDocHasChildren(): Observable<boolean> {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    // TODO: refactor openedDocument in store to another one, since it's of different format
    //       and not directly associated with tree-store
    const doc = query.getOpenedDocument();
    if (doc) {
      // TODO: this strategy is used in several toolbar plugins to prevent too early execution
      //       when opening page and hitting a toolbar button
      return query.selectEntity(doc.id)
        .pipe(
          filter(entity => entity !== undefined),
          take(1),
          map(entity => entity._hasChildren)
        );
    } else {
      return of(false);
    }
  }

  private buildResponse(isSuccess: boolean): EventData {

    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess ? null : 'this info comes from delete empty folder behaviour'
    };

  }
}
