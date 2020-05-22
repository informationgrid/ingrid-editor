import {McloudDoctype} from './mcloud/mcloud.doctype';
import {ProfileAddress} from './address/address.doctype';
import {ProfileFolder} from './folder.doctype';
import {TestDoctype} from './test/test.doctype';
import {Component, NgModule} from '@angular/core';
import {ProfileService} from '../app/services/profile.service';


@Component({
  template: 'dynamic component'
})
class MCloudComponent {

  constructor(service: ProfileService,
              mcloud: McloudDoctype, folder: ProfileFolder, test: TestDoctype, address: ProfileAddress) {

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
