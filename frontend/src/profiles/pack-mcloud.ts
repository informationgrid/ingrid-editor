import {McloudProfile} from './mcloud/mcloud.profile';
import {ProfileAddress} from './address/address.profile';
import {ProfileFolder} from './folder.profile';
import {TestProfile} from './test/test.profile';
import {Component, NgModule} from '@angular/core';
import {ProfileService} from '../app/services/profile.service';


@Component({
  template: 'dynamic component'
})
class MCloudComponent {

  constructor(service: ProfileService,
              mcloud: McloudProfile, folder: ProfileFolder, test: TestProfile, address: ProfileAddress) {

    service.registerProfiles([mcloud, folder, test, address]);

  }
}

@NgModule({
  declarations: [MCloudComponent]
})
export class ProfilePack {

  static getMyComponent() {
    return MCloudComponent;
  }

}
