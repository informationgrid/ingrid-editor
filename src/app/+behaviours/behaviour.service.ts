import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Behaviour, BehavioursDefault} from './behaviours';
import {EventManager} from '@angular/platform-browser';
import {Http, Response} from '@angular/http';
import {ModalService} from '../services/modal/modal.service';
import {ConfigService} from '../config/config.service';
import {AuthHttpError} from 'angular2-jwt';
import {Plugin} from './plugin';
import {Observable} from 'rxjs/Observable';
import {KeycloakService} from '../keycloak/keycloak.service';

// the variable containing additional behaviours is global!
declare const additionalBehaviours: any;

@Injectable()
export class BehaviourService {

  behaviours: Behaviour[] = [];
  systemBehaviours: Plugin[] = [];

  initialized: Promise<any>;

  constructor(private defaultBehaves: BehavioursDefault,
              private eventManager: EventManager,
              private http: Http, private modalService: ModalService, private configService: ConfigService) {

    this.behaviours = defaultBehaves.behaviours;
    this.systemBehaviours = defaultBehaves.systemBehaviours;

    // load user behaviours
    // const $script = require( 'scriptjs' );
    this.initialized = new Promise( (resolve, reject) => {
      // $script( './+behaviours/additionalBehaviours.js', () => {
      //   console.log( 'loaded additional behaviours', additionalBehaviours );

        // add all additional behaviours to the default ones
        this.behaviours.push( ...additionalBehaviours );

      if (KeycloakService.auth.loggedIn) {
          this.loadStoredBehaviours()
            .then( () => resolve() )
            .catch( () => reject );
      }

      // keycloak.getGroupsOfUser('');
        /*

        // if (this.authService.loggedIn()) {
          // request stored behaviour states from backend
          this.loadStoredBehaviours()
            .then( () => resolve() )
            .catch( () => reject );

        } else {
          /*const loginSubscriber = this.authService.loginStatusChange$.subscribe( loggedIn => {
            // console.log( 'logged in state changed to: ' + loggedIn );
            if (loggedIn) {
              loginSubscriber.unsubscribe();
              this.loadStoredBehaviours()
                .then( () => resolve() )
                .catch( () => reject );
            }
          });*/
        // }
      // } );
    } );
  }

  loadStoredBehaviours() {
    return this.http.get( this.configService.backendUrl + 'behaviours' ).toPromise().then( (response: Response) => {
      const storedBehaviours = response.json();

      // set correct active state to each behaviour
      this.behaviours.forEach( (behaviour) => {
        const stored = storedBehaviours.filter( (sb: any) => sb._id === behaviour.id );
        behaviour.isActive = stored.length > 0 ? stored[0].active : behaviour.defaultActive;
      } );

      // set correct active state to each system behaviour
      this.systemBehaviours.forEach( (behaviour) => {
        const stored = storedBehaviours.filter( (sb: any) => sb._id === behaviour.id );
        behaviour.isActive = stored.length > 0 ? stored[0].active : behaviour.defaultActive;
      } );

    } ).catch( (err: Error) => {
      if (!(err instanceof AuthHttpError)) {
        this.modalService.showError( err.message );
      }
    } );
  }

  apply(form: FormGroup, profile: string) {
    // possible updates see comment from kara: https://github.com/angular/angular/issues/9716
    this.behaviours
      .filter( beh => beh.isActive && beh.forProfile === profile )
      .forEach( behaviour => {
        if (!behaviour.title) {
          return;
        }

        if (behaviour.isActive) {
          // we need to run code in this context
          // TODO: add parameters for behaviour
          behaviour.register( form, this.eventManager );
        }
      } );
  }

  saveBehaviour(behaviour: Behaviour|Plugin) {
    const stripped = {
      _id: behaviour.id,
      active: behaviour.isActive
    };
    this.http.post( this.configService.backendUrl + 'behaviours', stripped ).toPromise().catch( err => {
      this.modalService.showError( err );
      return Observable.throw( err );
    } );
  }

  enable(id: string) {
    this.updateBehaviour( id, true );
  }

  disable(id: string) {
    this.updateBehaviour( id, false );
  }

  private updateBehaviour(id: string, isActive: boolean) {
    const found = this.behaviours
      .filter( beh => beh.id === id )
      .some( behaviour => {
        behaviour.isActive = isActive;
        this.saveBehaviour( behaviour );
        return true;
      } );

    if (!found) {
      this.systemBehaviours
        .filter( beh => beh.id === id )
        .forEach( behaviour => {
          behaviour.isActive = isActive;
          this.saveBehaviour( behaviour );
        } );
    }
  }

  unregisterAll() {
    this.behaviours
      .filter( beh => beh.isActive )
      .forEach( behaviour => {
        behaviour.unregister();
      } );
  }
}
