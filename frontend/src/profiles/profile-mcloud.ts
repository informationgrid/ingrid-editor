import { McloudDoctype } from "./mcloud/mcloud.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { ContextHelpService } from "../app/services/context-help/context-help.service";
import { McloudAddressDoctype } from "./mcloud/mcloud-address.doctype";

@Component({
  template: "dynamic component",
})
class MCloudComponent {
  constructor(
    service: ProfileService,
    contextHelpService: ContextHelpService,
    mcloud: McloudDoctype,
    folder: FolderDoctype,
    mcloudAddress: McloudAddressDoctype
  ) {
    const types = [mcloud, folder, mcloudAddress];

    service.registerProfiles(types);
  }
}

@NgModule({
  declarations: [MCloudComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return MCloudComponent;
  }
}
