import {FormularService} from "./formular.service";
import {EventManager} from "@angular/platform-browser";
import {Injectable} from "@angular/core";
import {Subscription} from "rxjs/Rx";
export interface Behaviour {
  id: string,
  title: string,
  description: string,
  defaultActive: boolean,
  register: (any) => void
}

@Injectable()
export class BehavioursDefault {

  constructor(private eventManager: EventManager, private formService: FormularService) {
  }

  /**
   * All event handlers are stored in this object mapped by the ID of the behaviour.
   *
   * @type {{}}
   */
  eventHandlers: any = {};

  initHandler(id: string) {
    this.eventHandlers[id] = {listeners: [], subscribers: []};
  }

  addListener= function (id: string, listener: Function) {
    if (!this.eventHandlers[id]) this.initHandler(id);
    this.eventHandlers[id].listeners.push(listener);
  };

  addSubscriber = function (id, subscriber: Subscription) {
    if (!this.eventHandlers[id]) this.initHandler(id);
    this.eventHandlers[id].subscribers.push(subscriber);
  };

  unregister = function (id) {
    this.eventHandlers[id].listeners.forEach( l => l() );
    this.eventHandlers[id].subscribers.forEach( s => s.unsubscribe() );
  };

  behaviours: Behaviour[] = [
    {
      id: "clickAndChangeTitle",
      title: "Click and change title + onSave validator",
      description: "",
      defaultActive: true,
      outer: this,
      register: function (form) {
        debugger;
        var taskEl = <HTMLElement>document.querySelector( '#taskId' );
        this.outer.addListener(this.id,
          this.outer.eventManager.addEventListener( taskEl, 'click', function () {
            console.log( 'Element was clicked' );
            form.find( ['mainInfo', 'title'] ).updateValue( "remotely updated" );
          } )
        );

        this.outer.addSubscriber(this.id,
          this.outer.formService.onBeforeSave.asObservable().subscribe( message => {
            message.errors.push( {id: 'taskId', error: 'I don\'t like this ID'} );
            console.log( 'in observer' );
          } )
        );
      }
    },
    {
      id: "mapAndChangeTitle",
      title: "Enter map and change title",
      description: "",
      defaultActive: true,
      outer: this,
      register: function(form) {
        let handler = this.outer.eventHandlers[this.id] = {listeners: [], subscribers: []};
        handler.subscribers.push(
          form.controls['map'].valueChanges.subscribe( function (val) {
            if (val === 'map') {
              form.find( ['mainInfo', 'title'] ).updateValue( 'Map was entered' );
            }
          } ),
          form.controls['categories'].valueChanges.subscribe( function (val) {
            console.log( 'categories changed: ', val );
          } )
        );
      }
    }
  ];
}