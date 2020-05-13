import {Inject, Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {EventManager} from '@angular/platform-browser';
import {Plugin} from '../../+behaviours/plugin';
import {ProfileService} from '../profile.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/internal/operators';
import {BehaviorDataService} from './behavior-data.service';
import {ProfileQuery} from '../../store/profile/profile.query';
import {SessionQuery} from '../../store/session.query';
import {PluginToken} from '../../tokens/plugin.token';

export interface BehaviourFormatBackend {
  _id: string;
  active: boolean;
  data?: any;
}

export interface Behaviour {
  id: string;
  title: string;
  description: string;
  defaultActive: boolean;
  forProfile?: string;
  isActive?: boolean;
  register: (form: FormGroup, eventManager: EventManager) => void;
  unregister: () => void;
  controls?: any[];
  outer?: any;
  isProfileBehaviour?: boolean;
  _state?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BehaviourService {

  behaviours: Behaviour[] = [];

  theSystemBehaviours$ = new BehaviorSubject<Plugin[]>([]);

  constructor(private eventManager: EventManager,
              private profileService: ProfileService,
              private profileQuery: ProfileQuery,
              private sessionQuery: SessionQuery,
              @Inject(PluginToken) private systemBehaviours: Plugin[],
              private dataService: BehaviorDataService) {

    this.loadStoredBehaviours()
      .pipe(
        tap(() => this.theSystemBehaviours$.next(this.systemBehaviours))
      )
      .subscribe(() => this.registerActiveBehaviours());

  }

  loadStoredBehaviours(): Observable<any> {

    return this.dataService.loadStoredBehaviours()
      .pipe(
        tap(b => console.log(`fetched behaviours`, b)),
        tap(storedBehaviours => {
          this.systemBehaviours.forEach((behaviour) => {
            const stored = storedBehaviours.filter((sb: any) => sb._id === behaviour.id);
            behaviour.isActive = stored.length > 0 ? stored[0].active : behaviour.defaultActive;
            behaviour.data = stored[0].data;
          });
        })
      );

  }

  apply(form: FormGroup, profile: string) {
    // possible updates see comment from kara: https://github.com/angular/angular/issues/9716
    this.behaviours
      .filter(beh => beh.isActive && beh.forProfile === profile)
      .forEach(behaviour => {
        if (!behaviour.title) {
          return;
        }

        if (behaviour.isActive) {
          // we need to run code in this context
          // TODO: add parameters for behaviour
          behaviour.register(form, this.eventManager);
        }
      });

    this.profileService.getProfiles().some(profileClass => {
      if (profileClass.id === profile) {
        if (profileClass.applyValidations) {
          profileClass.applyValidations(form);
        }
        if (profileClass.behaviours) {
          profileClass.behaviours
            .filter(_ => _.isActive)
            .forEach(behaviour => {
              behaviour.register(form, this.eventManager);
            });
        }
        return true;
      }
    });
  }

  /*unregisterAll() {
    this.behaviours
      // unregister all active behaviours that do have an unregister function
      .filter(beh => beh.isActive && beh.unregister)
      .forEach(behaviour => behaviour.unregister());
  }*/

  registerActiveBehaviours() {
    this.systemBehaviours
      .filter(systemBehaviour => systemBehaviour.isActive)
      .forEach(systemBehaviour => {
        console.log('register system behaviour: ' + systemBehaviour.name);
        systemBehaviour.register();
      });
  }

  saveBehaviours(behaviours: BehaviourFormatBackend[]) {
    this.updateState(behaviours);
    this.dataService.saveBehaviors(behaviours).subscribe();
  }

  private updateState(behaviours: BehaviourFormatBackend[]) {
    const activate: Plugin[] = [];
    const deactivate: Plugin[] = [];

    behaviours.forEach(behaviour => {
      const found = this.systemBehaviours.find(sysBehaviour => sysBehaviour.id === behaviour._id);
      if (behaviour.active !== found.isActive) {
        behaviour.active ? activate.push(found) : deactivate.push(found);
      }
      found.isActive = behaviour.active;
      found.data = behaviour.data;
    });

    activate.forEach(a => a.register());
    deactivate.forEach(a => a.unregister());

    this.theSystemBehaviours$.next(this.systemBehaviours);
  }

}
