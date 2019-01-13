import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';
import {createProfile, Profile} from './profile.model';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'profile' })
export class ProfileStore extends Store<Profile> {

  constructor() {
    super(createProfile(null));
  }

}

