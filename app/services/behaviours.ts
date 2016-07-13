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

  constructor(private eventManager: EventManager) {
  }

  eventHandlers: any = {};

  behaviours: Behaviour[] = [
    {
      id: "clickAndChangeTitle",
      title: "Click and change title",
      description: "",
      defaultActive: true,
      _eventHandler: null,
      register: function(form) {
        var taskEl = document.querySelector( '#taskId' );
        this.eventHandlers['clickAndChangeTitle'] = this.eventManager.addEventListener( taskEl, 'click', function () {
          console.log( 'Element was clicked' );
          form.controls['title'].updateValue( "remotely updated" );
        } );
      },
      unregister: function() {
        this.eventHandlers['clickAndChangeTitle']();
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
            form.controls['title'].updateValue( 'Map was entered' );
          }
        } );
      },
      unregister: function() {
        this.eventHandlers['mapAndChangeTitle'].unsubscribe();
      }
    }
  ];
}