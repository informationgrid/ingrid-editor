import {Injectable} from '@angular/core';
import {EntityState, EntityStore, StoreConfig} from '@datorama/akita';
import {Profile} from '../../services/formular/profile';

export interface ProfileState extends EntityState<Profile> {
  isInitialized: boolean
}

export function createProfile(params: Partial<Profile>) {
  return <Partial<Profile>>{
    isInitialized: false
  } as Profile;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'profile' })
export class ProfileStore extends EntityStore<ProfileState, Profile> {

  constructor() {
    super(createProfile(null));
  }

}

