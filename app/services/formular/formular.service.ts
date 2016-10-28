import {Injectable} from "@angular/core";
import {FieldBase} from "../../+form/controls";
import {UVPProfile} from "./uvp/uvp.profile";
import {profile as ISO_profile} from "./iso/iso.profile";
import {AddressProfile} from "./address/address.profile";
import {Subject} from "rxjs";

@Injectable()
export class FormularService {

  data = {};

  currentProfile: string;

  formDataSubject = new Subject<any>();
  formDataSubject$ = this.formDataSubject.asObservable();

  addressProfile = new AddressProfile();
  uvpProfile = new UVPProfile();

  docTypes = [
    {id: 'UVP', label: 'UVP'},
    // {id: 'ISO', label: 'ISO'},
    {id: 'ADDRESS', label: 'Address'}
  ];

  // Todo: get from a remote source of question metadata
  // Todo: make asynchronous
  getFields(profile: string) {
    // TODO: choose correct profile for data to be displayed
    let fields: FieldBase<any>[];

    if (profile === 'UVP') fields = this.uvpProfile.profile;
    else if (profile === 'ADDRESS') fields = this.addressProfile.profile;

    this.currentProfile = profile;

    // return a copy of our fields (immutable data!)
    return fields.sort((a, b) => a.order - b.order).slice(0);
  }

  getTitle(profile: string, doc: any) {
    // TODO: refactor to make it more flexible
    if (profile === 'UVP') return this.uvpProfile.getTitle(doc);
    else if (profile === 'ADDRESS') return this.addressProfile.getTitle(doc);
    else return '- untitled -';
  }

  getFieldsNeededForTitle(): string[] {
    // TODO: refactor
    let fields: string[] = [];
    fields.push(
      ...this.uvpProfile.getTitleFields(),
      ...this.addressProfile.getTitleFields()
    );
    return fields;
  }

  requestFormValues(): any {
    let formData: any = {};
    this.formDataSubject.next(formData);
    return formData;
  }

}
