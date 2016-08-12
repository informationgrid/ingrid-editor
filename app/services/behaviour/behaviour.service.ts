import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {BehavioursDefault, Behaviour} from './behaviours';
import {EventManager} from '@angular/platform-browser';

// the variable containing additional behaviours is global!
declare var additionalBehaviours: any;

@Injectable()
export class BehaviourService {

  behaviours: Behaviour[];

  initialized: Promise<any>;

  constructor(private defaultBehaves: BehavioursDefault, private eventManager: EventManager) {
    // eval(require( 'raw!./behaviours.js' ));
    this.behaviours = defaultBehaves.behaviours;

    // load user behaviours
    let $script = require( 'scriptjs' );
    this.initialized = new Promise( (resolve, reject) => {
      $script( './behaviours/additionalBehaviours.js', () => {
        console.log( 'loaded additional behaviours' );
        // TODO: activate again!
        this.behaviours.push( ...additionalBehaviours );

        this.behaviours.forEach( (behaviour) => {
          behaviour.isActive = behaviour.defaultActive;
        } );
        resolve();
      } );
    } );
  }

  apply(form: FormGroup, profile: string) {
    this.initialized.then( () => {
      // possible updates see comment from kara: https://github.com/angular/angular/issues/9716
      this.behaviours
        .filter( beh => beh.isActive && beh.forProfile === profile )
        .forEach( behaviour => {
          if (!behaviour.title) return;

          if (behaviour.isActive) {
            // we need to run code in this context
            // TODO: add parameters for behaviour
            behaviour.register( form, this.eventManager );
          }
        } );
    } );
  }

  enable(id: string) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        // behaviour.register( form, this.eventManager );
        behaviour.isActive = true;
        return true;
      }
    } );
  }

  disable(id: string) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        behaviour.isActive = false;
        return true;
      }
    } );
    // this.defaultBehaves.unregister( id );
  }

  unregisterAll() {
    this.behaviours
      .filter( beh => beh.isActive ) // && beh.forProfile === profile )
      .forEach( behaviour => {
        behaviour.unregister();
      } );
  }

  /*
    register(id: string, form: FormGroup) {
      this.behaviours.some( behaviour => {
        if (behaviour.id === id) {
          behaviour.register( form, this.eventManager );
          return true;
        }
      } );
    }*/

  /*  addDynamicBehaviours = function () {
      let addBeh = require( 'bundle!./additionalBehaviours.js' );
      addBeh( function (data: Function) {
        console.log( 'other loaded behaviours: ', data() );

      } );
    };*/
}
