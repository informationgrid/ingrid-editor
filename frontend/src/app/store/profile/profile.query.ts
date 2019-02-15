import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {Profile} from '../../services/formular/profile';
import {ProfileState, ProfileStore} from "./profile.store";

@Injectable({
  providedIn: 'root'
})
export class ProfileQuery extends QueryEntity<ProfileState, Profile> {

  isInitialized$ = this.select( store => store.isInitialized);

  constructor(protected store: ProfileStore) {
    super(store);
  }

}
