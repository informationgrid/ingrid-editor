import {FormularService} from '../formular/formular.service';
import {EventManager} from '@angular/platform-browser';
import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {Form} from '@angular/forms';
import {TextboxField} from '../../form/controls/field-textbox';
export interface Behaviour {
  id: string;
  title: string;
  description: string;
  defaultActive: boolean;
  register: (_: any, eventManager: EventManager) => void;
  controls?: any[];
  outer?: any;
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

  /**
   * Initialize the containers for storing listeners and subscribers for a behaviour.
   * @param id
   */
  initHandler(id: string) {
    this.eventHandlers[id] = {listeners: [], subscribers: []};
  }

  /**
   * Add a listener to a given behaviour.
   * @param id
   * @param listener
   */
  addListener = function (id: string, listener: Function) {
    if (!this.eventHandlers[id]) this.initHandler( id );
    this.eventHandlers[id].listeners.push( listener );
  };

  /**
   * Add subscriber to a given behaviour.
   * @param id
   * @param subscriber
   */
  addSubscriber = function (id: string, subscriber: Subscription) {
    if (!this.eventHandlers[id]) this.initHandler( id );
    this.eventHandlers[id].subscribers.push( subscriber );
  };

  /**
   * Unregister all listeners and subscribers to a given behaviour.
   * @param id
   */
  unregister = function (id: string) {
    this.eventHandlers[id].listeners.forEach( (l: Function) => l() );
    this.eventHandlers[id].subscribers.forEach( (s: Subscription) => s.unsubscribe() );
  };

  /**
   * The definition of all behaviours.
   * @type {{id: string; title: string; description: string; defaultActive: boolean; outer: BehavioursDefault; register: Function}[]}
   */
  behaviours: Behaviour[] = [
    {
      id: 'clickAndChangeTitle',
      title: 'Click and change title + onSave validator',
      description: '',
      defaultActive: true,
      outer: this,
      register: function (form) {
        debugger;
        let taskEl = <HTMLElement>document.querySelector( '#taskId' );
        this.outer.addListener( this.id,
          this.outer.eventManager.addEventListener( taskEl, 'click', function () {
            console.log( 'Element was clicked' );
            form.find( ['mainInfo', 'title'] ).updateValue( 'remotely updated' );
          } )
        );

        this.outer.addSubscriber( this.id,
          this.outer.formService.onBeforeSave.asObservable().subscribe( (message: any) => {
            message.errors.push( {id: 'taskId', error: 'I don\'t like this ID'} );
            console.log( 'in observer' );
          } )
        );
      }
    },
    {
      id: 'mapAndChangeTitle',
      title: 'Enter map and change title',
      description: '',
      defaultActive: true,
      outer: this,
      register: function (form) {
        this.outer.addSubscriber( this.id,
          form.controls['map'].valueChanges.subscribe( function (val: string) {
            if (val === 'map') {
              form.find( ['mainInfo', 'title'] ).updateValue( 'Map was entered' );
            }
          } )
        );

        this.outer.addSubscriber( this.id,
          form.controls['categories'].valueChanges.subscribe( function (val: string) {
            console.log( 'categories changed: ', val );
          } )
        );
      }
    },
    {
      id: 'addControl',
      title: 'Add control to form',
      description: '',
      defaultActive: true,
      outer: this,
      register: function (form: Form) {

        // form.addControl(new FormControl('dynamic'))
      },
      controls: [
        new TextboxField( {
          key: 'behaviourField',
          label: 'Dynamic Behaviour Field',
          // domClass: 'half',
          order: 0
        } )
      ]
    }
  ];
}