import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Behaviour, BehavioursDefault } from './behaviours';
import { EventManager } from '@angular/platform-browser';
import { ModalService } from '../services/modal/modal.service';
import { ConfigService, Configuration } from '../services/config.service';
import { Plugin } from './plugin';
import { HttpClient } from '@angular/common/http';
import { ProfileService } from '../services/profile.service';
import { throwError } from 'rxjs/index';
import { tap } from 'rxjs/internal/operators';

// the variable containing additional behaviours is global!
declare const additionalBehaviours: any;
declare const webpackJsonp: any;

@Injectable({
  providedIn: 'root'
})
export class BehaviourService {

  behaviours: Behaviour[] = [];
  systemBehaviours: Plugin[] = [];

  initialized: Promise<any>;
  private configuration: Configuration;

  constructor(private defaultBehaves: BehavioursDefault,
              private eventManager: EventManager,
              private profileService: ProfileService,
              private http: HttpClient, private modalService: ModalService, private configService: ConfigService) {

    this.behaviours = defaultBehaves.behaviours;
    this.systemBehaviours = defaultBehaves.systemBehaviours;
    this.configuration = configService.getConfiguration();

    // this.initialized = new Promise((resolve, reject) => {
    // $script( './+behaviours/additionalBehaviours.js', () => {
    //   console.log( 'loaded additional behaviours', additionalBehaviours );

    // add all additional behaviours to the default ones
    // this.behaviours.push(...additionalBehaviours);

    this.initialized = profileService.getProfiles()
      .then( (profiles) => {
        profiles.forEach( p => {
          if (p.behaviours) {
            p.behaviours.forEach( behaviour => behaviour.forProfile = p.id );
            this.behaviours.push( ...p.behaviours );
          }
        } );
      } )
      .then( () => this.loadStoredBehaviours() );

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
    // });
  }

  loadStoredBehaviours(): Promise<any> {
    return new Promise<any>(resolve => {
      this.http.get<any[]>( this.configuration.backendUrl + 'behaviours' )
        .pipe(
          tap(b => console.log(`fetched behaviours`, b))
          // catchError(this.handleError('loadStoredBehaviours', []))
        )
        .subscribe( (storedBehaviours: any[]) => {
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
          resolve();
        } );
    });
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  /*private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }*/

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

    this.profileService.getProfiles().then( profiles => {
      profiles.some( profileClass => {
        if (profileClass.id === profile) {
          if (profileClass.applyValidations) {
            profileClass.applyValidations( form );
          }
          if (profileClass.behaviours) {
            profileClass.behaviours
              .filter( _ => _.isActive )
              .forEach( behaviour => {
                behaviour.register( form, this.eventManager );
              } );
          }
          return true;
        }
      } );
    } );
  }

  saveBehaviour(behaviour: Behaviour | Plugin) {
    const stripped = {
      _id: behaviour.id,
      active: behaviour.isActive
    };
    this.http.post( this.configuration.backendUrl + 'behaviours', stripped ).toPromise().catch( err => {
      // this.modalService.showError( err );
      // TODO: remove since it's already handled
      return throwError( err );
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
    // unregister all active behaviours that do have an unregister function
      .filter( beh => beh.isActive && beh.unregister )
      .forEach( behaviour => behaviour.unregister() );
  }
}
