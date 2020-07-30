import {McloudDoctype} from './mcloud/mcloud.doctype';
import {AddressDoctype} from './address/address.doctype';
import {FolderDoctype} from './folder/folder.doctype';
import {TestDoctype} from './test/test.doctype';
import {Component, NgModule} from '@angular/core';
import {ProfileService} from '../app/services/profile.service';
import {ContextHelpService} from '../app/services/context-help/context-help.service';


@Component({
  template: 'dynamic component'
})
class MCloudComponent {

  constructor(service: ProfileService, contextHelpService: ContextHelpService,
              mcloud: McloudDoctype, folder: FolderDoctype, test: TestDoctype, address: AddressDoctype) {

    const types = [mcloud, folder, test, address];
    service.registerProfiles(types)

    /*const helpIdsObservables = types.map(type => contextHelpService.getAvailableHelpFieldIds('mcloud', type.id));

    forkJoin(helpIdsObservables)
      .pipe(
        delay(5000),
        tap(results => results.forEach( (result, index) => types[index].init(result))),
        tap(() => service.finishProfileInitialization())
      )
      .subscribe();*/

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
