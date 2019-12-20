import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {ProfileState, ProfileStore} from "./profile.store";
import {ProfileAbstract} from './profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileQuery extends QueryEntity<ProfileState, ProfileAbstract> {

  isInitialized$ = this.select(store => store.isInitialized);


  constructor(protected store: ProfileStore) {
    super(store);
  }

  getIconClass(id: string) {
    return this.getEntity(id).iconClass;
  }

}
