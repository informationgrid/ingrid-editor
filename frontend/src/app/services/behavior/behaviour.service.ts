import {Inject, Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {EventManager} from '@angular/platform-browser';
import {Plugin} from '../../+behaviours/plugin';
import {ProfileService} from '../profile.service';
import {Observable, throwError} from 'rxjs';
import {tap} from 'rxjs/internal/operators';
import {BehaviorDataService} from './behavior-data.service';
import {ProfileQuery} from '../../store/profile/profile.query';
import {SessionQuery} from '../../store/session.query';
import {BehaviourStore, PluginInfo} from '../../store/behaviour/behaviour.store';
import {applyTransaction} from '@datorama/akita';
import {PluginToken} from '../../tokens/plugin.token';


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
  systemBehaviours: Plugin[] = [];

  constructor(private eventManager: EventManager,
              private profileService: ProfileService,
              private profileQuery: ProfileQuery,
              private sessionQuery: SessionQuery,
              private behaviourStore: BehaviourStore,
              @Inject(PluginToken) autoPlugins: Plugin[],
              private dataService: BehaviorDataService) {

    this.systemBehaviours = autoPlugins;

    /*this.initialized = new Promise(resolve => {
      // do nothing if user has no assigned catalogs
      configService.$userInfo.subscribe(info => {
        if (info.assignedCatalogs.length > 0) {

          this.sessionQuery.isProfilesInitialized$.subscribe(() => {
            const profiles = this.profileService.getProfiles();
            profiles.forEach(p => {
              if (p.behaviours) {
                p.behaviours.forEach(behaviour => behaviour.forProfile = p.id);
                this.behaviours.push(...p.behaviours);
              }
            });
            // this.loadStoredBehaviours();
            resolve();
          });
        }
      });

    });*/

    this.loadStoredBehaviours()
      .pipe(
        tap(() => this.updateStore())
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

  saveBehaviour(behaviour: Behaviour | Plugin) {
    const stripped = {
      _id: behaviour.id,
      active: behaviour.isActive
    };

    this.dataService.saveBehavior(stripped).toPromise().catch(err => {
      // this.modalService.showError( err );
      // TODO: remove since it's already handled
      return throwError(err);
    });
  }

  enable(id: string) {
    this.updateBehaviour(id, true);
    this.behaviourStore.addActive([id]);
  }

  disable(id: string) {
    this.updateBehaviour(id, false);
    this.behaviourStore.removeActive(id);
  }

  private updateBehaviour(id: string, isActive: boolean) {
    const found = this.behaviours
      .filter(beh => beh.id === id)
      .some(behaviour => {
        behaviour.isActive = isActive;
        this.saveBehaviour(behaviour);
        return true;
      });

    if (!found) {
      this.systemBehaviours
        .filter(beh => beh.id === id)
        .forEach(behaviour => {
          behaviour.isActive = isActive;
          isActive ? behaviour.register() : behaviour.unregister();
          this.saveBehaviour(behaviour);
        });
    }
  }

  unregisterAll() {
    this.behaviours
      // unregister all active behaviours that do have an unregister function
      .filter(beh => beh.isActive && beh.unregister)
      .forEach(behaviour => behaviour.unregister());
  }

  registerActiveBehaviours() {
    this.systemBehaviours
      .filter(systemBehaviour => systemBehaviour.isActive)
      .forEach(systemBehaviour => {
        console.log('register system behaviour: ' + systemBehaviour.name);
        systemBehaviour.register();
      });
  }

  private updateStore() {
    const pluginInfos: PluginInfo[] = this.systemBehaviours.map(behaviour => ({
      id: behaviour.id,
      title: behaviour.name,
      description: behaviour.description,
      initialActive: behaviour.defaultActive
    }));

    const activeIds = this.systemBehaviours
      .filter(behaviour => behaviour.isActive)
      .map(activeBehaviour => activeBehaviour.id);

    applyTransaction(() => {
      this.behaviourStore.set(pluginInfos);
      this.behaviourStore.setActive(activeIds);
    });
  }
}
