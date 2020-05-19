import {UVPProfile} from './uvp/uvp.profile';
import {ProfileFolder} from './folder.profile';
import {Component, NgModule} from '@angular/core';
import {ProfileService} from '../app/services/profile.service';
import {ProfileAddress} from './address/address.profile';

@Component({
  template: 'dynamic component'
})
class UVPComponent {

  constructor(service: ProfileService,
              folder: ProfileFolder, uvp: UVPProfile, address: ProfileAddress) {

    service.registerProfiles([folder, uvp, address]);

  }
}

@NgModule({
  declarations: [UVPComponent]
})
export class ProfilePack {

  static getMyComponent() {
    return UVPComponent;
  }

}
