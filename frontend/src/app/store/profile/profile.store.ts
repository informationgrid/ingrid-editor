import {Injectable} from '@angular/core';
import {EntityState, EntityStore, StoreConfig} from '@datorama/akita';
import {ProfileAbstract} from './profile.model';

export interface ProfileState extends EntityState<ProfileAbstract> {
  isInitialized: boolean
}

export function createProfile(params: Partial<ProfileAbstract>) {
  return <Partial<ProfileAbstract>>{
    isInitialized: false
  } as ProfileAbstract;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'profile' })
export class ProfileStore extends EntityStore<ProfileState, ProfileAbstract> {

  constructor() {
    super(createProfile(null));
  }

}

