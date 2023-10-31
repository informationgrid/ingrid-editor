import { BmiDoctype } from "./bmi/bmi.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { ContextHelpService } from "../app/services/context-help/context-help.service";
import { BmiAddressDoctype } from "./bmi/bmi-address.doctype";
import { NgxFlowModule } from "@flowjs/ngx-flow";
import { ReportsService } from "../app/+reports/reports.service";

@Component({
  template: "",
})
class BmiComponent {
  constructor(
    service: ProfileService,
    contextHelpService: ContextHelpService,
    reportsService: ReportsService,
    bmi: BmiDoctype,
    folder: FolderDoctype,
    bmiAddress: BmiAddressDoctype,
  ) {
    const types = [bmi, folder, bmiAddress];

    service.registerProfiles(types);

    reportsService.setFilter((route) => route.path != "url-check");
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
