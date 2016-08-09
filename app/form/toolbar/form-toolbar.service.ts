import {Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';

export interface ToolbarItem {
  tooltip: string;
  cssClasses: string;
  eventId: string;
}

@Injectable()
export class FormToolbarService {

  toolbar$: Observable<ToolbarItem>;
  toolbarObserver: Observer<ToolbarItem>;

  toolbarEvent$: Observable<string>;
  toolbarEventObserver: Observer<string>;

  _buttons: ToolbarItem[] = [
    {tooltip: 'Save', cssClasses: 'glyphicon glyphicon-save', eventId: 'SAVE'},
    {tooltip: 'Print', cssClasses: 'glyphicon glyphicon-print', eventId: 'PRINT'},
    {tooltip: 'Remove', cssClasses: 'glyphicon glyphicon-remove', eventId: 'DELETE'}
  ];

  constructor() {
    this.toolbar$ = new Observable<ToolbarItem>( (observer: any) => this.toolbarObserver = observer );
    this.toolbarEvent$ = new Observable<string>( (observer: any) => this.toolbarEventObserver = observer );
  }

  get buttons(): ToolbarItem[] {
    return this._buttons;
  }

  addButton(button: ToolbarItem, pos?: number) {
    this._buttons.push( button );
    this.toolbarObserver.next( button );
    console.log( 'NOT IMPLEMENTED YET' );
  }

  sendEvent(eventId: string) {
    this.toolbarEventObserver.next( eventId );
  }


}