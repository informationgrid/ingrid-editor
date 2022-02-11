import { AdmissionProcedureDoctype } from "./uvp/admission-procedure.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { AddressDoctype } from "./address/address.doctype";

@Component({
  template: "dynamic component",
})
class UVPComponent {
  constructor(
    service: ProfileService,
    folder: FolderDoctype,
    uvp: AdmissionProcedureDoctype,
    address: AddressDoctype
  ) {
    service.registerProfiles([folder, uvp, address]);
  }
}

@NgModule({
  declarations: [UVPComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return UVPComponent;
  }
}
