import {FormularService} from "./formular.service";
import {EventManager} from "@angular/platform-browser";
import {Injectable} from "@angular/core";
export interface Behaviour {
  id: string,
  title: string,
  description: string,
  defaultActive: boolean,
  register: (any) => void,
  unregister: () => void
}

@Injectable()
export class BehavioursDefault {

  constructor(private eventManager: EventManager, private formService: FormularService) {
  }

  eventHandlers: any = {};

  behaviours: Behaviour[] = [
    {
      id: "clickAndChangeTitle",
      title: "Click and change title + onSave validator",
      description: "",
      defaultActive: true,
      _eventHandler: null,
      register: function (form) {
        var taskEl = document.querySelector( '#taskId' );
        this.eventHandlers['clickAndChangeTitle'] = {listeners: [], subscribers: []};
        this.eventHandlers['clickAndChangeTitle'].listeners.push( this.eventManager.addEventListener( taskEl, 'click', function () {
          console.log( 'Element was clicked' );
          // form.controls['mainInfo.title'].updateValue( "remotely updated" );
          form.find(['mainInfo', 'title']).updateValue( "remotely updated" );
        } ) );

        this.eventHandlers['clickAndChangeTitle'].subscribers.push( this.formService.onBeforeSave.asObservable().subscribe( message => {
          message.errors.push( {id: 'taskId', error: 'I don\'t like this ID'} );
          console.log( 'in observer' );
        } ) );
      },
      unregister: function () {
        this.eventHandlers['clickAndChangeTitle'].listeners.forEach( l => l() );
        this.eventHandlers['clickAndChangeTitle'].subscribers.forEach( s => s.unsubscribe() );
      }
    },
    {
      id: "mapAndChangeTitle",
      title: "Enter map and change title",
      description: "",
      defaultActive: true,
      _eventHandler: null,
      register: (form) => {
        this.eventHandlers['mapAndChangeTitle'] = form.controls['map'].valueChanges.subscribe( function (val) {
          if (val === 'map') {
            // form.controls['title'].updateValue( 'Map was entered' );
            form.find(['mainInfo', 'title']).updateValue( 'Map was entered' );
          }
        } );
      },
      unregister: function () {
        this.eventHandlers['mapAndChangeTitle'].unsubscribe();
      }
    }
  ];
}