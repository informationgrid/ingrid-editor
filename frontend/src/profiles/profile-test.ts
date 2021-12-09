import { McloudDoctype } from "./mcloud/mcloud.doctype";
import { AddressDoctype } from "./address/address.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { TestDoctype } from "./test/test.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { ContextHelpService } from "../app/services/context-help/context-help.service";
import { McloudAddressDoctype } from "./mcloud/mcloud-address.doctype";

@Component({
  template: "dynamic component",
})
class TestComponent {
  constructor(
    service: ProfileService,
    contextHelpService: ContextHelpService,
    mcloud: McloudDoctype,
    folder: FolderDoctype,
    test: TestDoctype,
    address: AddressDoctype
  ) {
    const types = [mcloud, folder, test, address];

    service.registerProfiles(types);
  }
}

@NgModule({
  declarations: [TestComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return TestComponent;
  }
}
