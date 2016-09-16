import {Injectable} from "@angular/core";
import {FieldBase} from "../../+form/controls/field-base";
import {profile as UVP_profile} from "./uvp/uvp.profile";
import {profile as ISO_profile} from "./iso/iso.profile";

@Injectable()
export class FormularService {

  data = {};

  currentProfile: string;

  // Todo: get from a remote source of question metadata
  // Todo: make asynchronous
  getFields(profile: string) {

    // TODO: choose correct profile for data to be displayed
    let fields: FieldBase<any>[];

    if (profile === 'UVP') fields = UVP_profile;
    else if (profile === 'ISO') fields = ISO_profile;

    this.currentProfile = profile;

    // return a copy of our fields (immutable data!)
    return fields.sort((a, b) => a.order - b.order).slice(0);
  }

  /*getLoadedData() {
   return this.data;
   }*/

  getNewDocument(profile: string) {
    return {};
  }


}
