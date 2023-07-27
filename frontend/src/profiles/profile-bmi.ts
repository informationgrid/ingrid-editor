import { BmiDoctype } from "./bmi/bmi.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { ContextHelpService } from "../app/services/context-help/context-help.service";
import { BmiAddressDoctype } from "./bmi/bmi-address.doctype";
import { NgxFlowModule } from "@flowjs/ngx-flow";

@Component({
  template: "",
})
class BmiComponent {
  constructor(
    service: ProfileService,
    contextHelpService: ContextHelpService,
    bmi: BmiDoctype,
    folder: FolderDoctype,
    bmiAddress: BmiAddressDoctype
  ) {
    const types = [bmi, folder, bmiAddress];

    service.registerProfiles(types);
  }
}

@NgModule({
  declarations: [BmiComponent],
  imports: [NgxFlowModule],
})
export class ProfilePack {
  static getMyComponent() {
    return BmiComponent;
  }
}
