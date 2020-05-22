import {UvpDoctype} from './uvp/uvp.doctype';
import {ProfileFolder} from './folder.doctype';
import {Component, NgModule} from '@angular/core';
import {ProfileService} from '../app/services/profile.service';
import {ProfileAddress} from './address/address.doctype';

@Component({
  template: 'dynamic component'
})
class UVPComponent {

  constructor(service: ProfileService,
              folder: ProfileFolder, uvp: UvpDoctype, address: ProfileAddress) {

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
