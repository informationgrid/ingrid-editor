import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {BehavioursDefault, Behaviour} from './behaviours';
import {EventManager} from '@angular/platform-browser';

// the variable containing additional behaviours is global!
declare var additionalBehaviours: any;

@Injectable()
export class BehaviourService {

  behaviours: Behaviour[];

  constructor(private defaultBehaves: BehavioursDefault, private eventManager: EventManager) {
    // eval(require( 'raw!./behaviours.js' ));
    this.behaviours = defaultBehaves.behaviours;
  }

  apply(form: FormGroup) {

    // load user behaviours
    let $script = require( 'scriptjs' );
    $script( './behaviours/additionalBehaviours.js', () => {
      console.log( 'loaded additional behaviours' );
      this.behaviours.push( ...additionalBehaviours );

      // possible updates see comment from kara: https://github.com/angular/angular/issues/9716

      this.behaviours.forEach( behaviour => {
        if (!behaviour.title) return;

        if (behaviour.defaultActive) {
          // we need to run code in this context
          // TODO: add parameters for behaviour
          behaviour.register( form, this.eventManager );
        }
      } );
    } );
  }

  enable(id: string, form: FormGroup) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        behaviour.register( form, this.eventManager );
        return true;
      }
    } );
  }

  disable(id: string) {
    this.defaultBehaves.unregister( id );
  }

/*  addDynamicBehaviours = function () {
    let addBeh = require( 'bundle!./additionalBehaviours.js' );
    addBeh( function (data: Function) {
      console.log( 'other loaded behaviours: ', data() );

    } );
  };*/
}
