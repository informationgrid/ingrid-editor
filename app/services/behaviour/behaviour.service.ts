import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {BehavioursDefault, Behaviour} from './behaviours';
import {EventManager} from '@angular/platform-browser';
import {Http, Response} from '@angular/http';
import {ModalService} from '../modal/modal.service';
import {Observable} from 'rxjs';
import {ConfigService} from '../../config/config.service';

// the variable containing additional behaviours is global!
declare let additionalBehaviours: any;

@Injectable()
export class BehaviourService {

  behaviours: Behaviour[];

  initialized: Promise<any>;

  constructor(private defaultBehaves: BehavioursDefault, private eventManager: EventManager,
      private http: Http, private modalService: ModalService, private configService: ConfigService) {
    // eval(require( 'raw!./behaviours.js' ));
    this.behaviours = defaultBehaves.behaviours;

    // load user behaviours
    let $script = require( 'scriptjs' );
    this.initialized = new Promise( (resolve, reject) => {
      $script( './behaviours/additionalBehaviours.js', () => {
        console.log( 'loaded additional behaviours' );
        // TODO: activate again!
        this.behaviours.push( ...additionalBehaviours );
        this.http.get(this.configService.backendUrl + 'behaviours').toPromise().then((response: Response) => {
          let storedBehaviours = response.json();
          this.behaviours.forEach( (behaviour) => {
            let stored = storedBehaviours.filter( (sb: any) => sb._id === behaviour.id);
            behaviour.isActive = stored.length > 0 ? stored[0].active : behaviour.defaultActive;
          } );
          resolve();
        }).catch((err: Error) => {
          this.modalService.showError(err.message);
          resolve();
        });
      } );
    } );
  }

  apply(form: FormGroup, profile: string) {
      // possible updates see comment from kara: https://github.com/angular/angular/issues/9716
      this.behaviours
        .filter( beh => beh.isActive && beh.forProfile === profile )
        .forEach( behaviour => {
          if (!behaviour.title) return;

          if (behaviour.isActive) {
            // we need to run code in this context
            // TODO: add parameters for behaviour
            behaviour.register( form, this.eventManager );
            if (behaviour.addValidators) behaviour.addValidators( form );
          }
        } );
  }

  saveBehaviour(behaviour: Behaviour) {
    let stripped = {
      _id: behaviour.id,
      active: behaviour.isActive
    };
    this.http.post(this.configService.backendUrl + 'behaviours', stripped).toPromise().catch( err => {
      this.modalService.showError(err);
      return Observable.throw(err);
    });
  }

  enable(id: string) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        // behaviour.register( form, this.eventManager );
        behaviour.isActive = true;
        // save changed behaviour
        this.saveBehaviour(behaviour);
        return true;
      }
    } );
  }

  disable(id: string) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        behaviour.isActive = false;
        this.saveBehaviour(behaviour);
        return true;
      }
    } );
  }

  unregisterAll() {
    this.behaviours
      .filter( beh => beh.isActive ) // && beh.forProfile === profile )
      .forEach( behaviour => {
        behaviour.unregister();
      } );
  }
}
