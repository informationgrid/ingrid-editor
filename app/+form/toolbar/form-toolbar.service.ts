import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

export interface DefaultToolbarItem {
  id: string;
}
export interface ToolbarItem extends DefaultToolbarItem {
  tooltip: string;
  cssClasses: string;
  eventId: string;
  active?: boolean;
}
export interface Separator extends DefaultToolbarItem{
  isSeparator: boolean;
}

@Injectable()
export class FormToolbarService {

  // event when a new button was added
  toolbar$: Subject<ToolbarItem|Separator>;

  // events coming from a toolbar button
  toolbarEvent$: Subject<string>;

  _buttons: Array<ToolbarItem|Separator> = [
    {id: 'toolBtnNew', tooltip: 'New', cssClasses: 'glyphicon glyphicon-file', eventId: 'NEW_DOC', active: true},
    // {tooltip: 'Load', cssClasses: 'glyphicon glyphicon-folder-open', eventId: 'LOAD'},
    {id: 'toolBtnSave', tooltip: 'Save', cssClasses: 'glyphicon glyphicon-save-file', eventId: 'SAVE', active: true},
    {id: 'toolBtnLoadSaveSeparator', isSeparator: true},

    {id: 'toolBtnRemove', tooltip: 'Remove', cssClasses: 'glyphicon glyphicon-trash', eventId: 'DELETE', active: true}
  ];

  constructor() {
    this.toolbar$ = new Subject<ToolbarItem>();
    this.toolbarEvent$ = new Subject<string>();
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

  addButton(button: ToolbarItem|Separator, pos?: number) {
    if (!pos) pos = this._buttons.length;
    this._buttons.splice(pos, 0, button);
    this.toolbar$.next(button);
  }

  removeButton(id: string): void {
    let index = null;
    this._buttons.some( (b, i) => { if (b.id === id) { index = i; return true; } } );

    if (index !== null) {
      this._buttons.splice(index, 1);
    }
  }

  sendEvent(eventId: string) {
    this.toolbarEvent$.next(eventId);
  }


  /**
   * Set the state of a toolbar button to enabled or disabled.
   * @param eventId
   * @param active
   */
  setButtonState(eventId: string, active: boolean) {
    let button = <ToolbarItem>this.getButtonById( eventId );
    button.active = active;
  }

  private getButtonById(id: string): DefaultToolbarItem {
    return this._buttons.find( (b) => b.id === id );
  }
}