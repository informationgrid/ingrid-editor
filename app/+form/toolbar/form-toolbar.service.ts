import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

export interface ToolbarItem {
  tooltip: string;
  cssClasses: string;
  eventId: string;
}
export interface Separator {
  isSeparator: boolean;
}

@Injectable()
export class FormToolbarService {

  toolbar$: Subject<ToolbarItem>;

  toolbarEvent$: Subject<string>;

  _buttons:  Array<ToolbarItem|Separator> = [
    {tooltip: 'New', cssClasses: 'glyphicon glyphicon-file', eventId: 'NEW_DOC'},
    // {tooltip: 'Load', cssClasses: 'glyphicon glyphicon-folder-open', eventId: 'LOAD'},
    {tooltip: 'Save', cssClasses: 'glyphicon glyphicon-floppy-disk', eventId: 'SAVE'},
    { isSeparator: true },
    {tooltip: 'Print', cssClasses: 'glyphicon glyphicon-print', eventId: 'PRINT'},
    {tooltip: 'Remove', cssClasses: 'glyphicon glyphicon-remove', eventId: 'DELETE'}
  ];

  constructor() {
    this.toolbar$ = new Subject<ToolbarItem>();
    this.toolbarEvent$ = new Subject<string>(); // new Observable<string>( (observer: any) => this.toolbarEventObserver = observer );
  }

  /**
   * Get an observable to subscribe to events from the toolbar.
   * @returns {Observable<string>}
   */
  getEventObserver() {
    return this.toolbarEvent$.asObservable();
  }

  /**
   * Get an observable to subscribe to changes to the toolbar (e.g. new button)
   * @returns {Observable<string>}
   */
  getItemObserver() {
    return this.toolbarEvent$.asObservable();
  }


  get buttons(): Array<ToolbarItem|Separator> {
    return this._buttons;
  }

  addButton(button: ToolbarItem, pos?: number) {
    this._buttons.push( button );
    this.toolbar$.next( button );
  }

  sendEvent(eventId: string) {
    this.toolbarEvent$.next( eventId );
  }


}