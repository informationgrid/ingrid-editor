import {Injectable} from "@angular/core";
import {FieldBase} from "../../+form/controls";
import {profile as UVP_profile} from "./uvp/uvp.profile";
import {profile as ISO_profile} from "./iso/iso.profile";
import {Subject} from "rxjs";

@Injectable()
export class FormularService {

  data = {};

  currentProfile: string;

  formDataSubject = new Subject<any>();

  docTypes = [
    {id: 'UVP', label: 'UVP'},
    {id: 'ISO', label: 'ISO'}
  ];

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

  requestFormValues(): any {
    let formData: any = {};
    this.formDataSubject.next(formData);
    return formData;
  }

}
