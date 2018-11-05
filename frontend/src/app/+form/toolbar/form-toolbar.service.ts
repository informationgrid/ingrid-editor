import {Injectable} from '@angular/core';
import { Subject } from 'rxjs/index';

export interface DefaultToolbarItem {
  id: string;
  pos: number;
}
export interface ToolbarItem extends DefaultToolbarItem {
  tooltip: string;
  cssClasses: string;
  eventId: string;
  active?: boolean;
}
export interface Separator extends DefaultToolbarItem {
  isSeparator: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FormToolbarService {

  // event when a new button was added
  toolbar$: Subject<ToolbarItem|Separator>;

  // events coming from a toolbar button
  toolbarEvent$: Subject<string>;

  _buttons: Array<ToolbarItem|Separator> = [
    {id: 'toolBtnNew', tooltip: 'New', cssClasses: 'add', eventId: 'NEW_DOC', pos: 10, active: true},
    {id: 'toolBtnSave', tooltip: 'Save', cssClasses: 'save', eventId: 'SAVE', pos: 20, active: false}
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

  get buttons(): Array<ToolbarItem|Separator> {
    return this._buttons;
  }

  addButton(button: ToolbarItem|Separator) {
    const pos = this._buttons.length;

    this._buttons.splice(pos, 0, button);

    // sort buttons
    this._buttons.sort( (a, b) => a.pos < b.pos ? -1 : a.pos === b.pos ? 0 : 1 );

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
    const button = <ToolbarItem>this.getButtonById( eventId );
    button.active = active;
  }

  private getButtonById(id: string): DefaultToolbarItem {
    return this._buttons.find( (b) => b.id === id );
  }
}
