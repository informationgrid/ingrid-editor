import {Injectable} from '@angular/core';
import {FieldBase} from '../../+form/controls';
import {FolderProfile} from './folder/folder.profile';
import {UVPProfile} from './uvp/uvp.profile';
import {AddressProfile} from './address/address.profile';
import {Observable, Subject, Subscription} from 'rxjs';
import {Profile} from './profile';
import {CodelistService} from '../../+form/services/codelist.service';

@Injectable()
export class FormularService {

  data = {};

  currentProfile: string;

  formDataSubject = new Subject<any>();
  formDataSubject$ = this.formDataSubject.asObservable();

  newDocumentSubject = new Subject<any>();
  newDocumentSubject$ = this.newDocumentSubject.asObservable();

  selectedDocuments = new Subject<string[]>();
  selectedDocuments$: Observable<string[]> = this.selectedDocuments.asObservable();

  addressProfile = new AddressProfile();
  uvpProfile = new UVPProfile(this.codelistService);
  folderProfile = new FolderProfile();

  docTypes = [
    {id: 'UVP', label: 'UVP'},
    // {id: 'ISO', label: 'ISO'},
    {id: 'ADDRESS', label: 'Address'},
    {id: 'FOLDER', label: 'Folder'}
  ];

  constructor(private codelistService: CodelistService) {}

  getFields(profile: string) {
    let fields: FieldBase<any>[];

    fields = this.getProfile(profile).profile;

    this.currentProfile = profile;

    // return a copy of our fields (immutable data!)
    return fields.sort((a, b) => a.order - b.order).slice(0);
  }

  getProfile(id: string): Profile {
    let profile: any = null;
    if (id === 'UVP') profile = this.uvpProfile;
    else if (id === 'ADDRESS') profile = this.addressProfile;
    else if (id === 'FOLDER') profile = this.folderProfile;
    else {
      throw Error('Unknown profile: ' + id);
    }
    return profile;
  }

  getTitle(profile: string, doc: any) {
    if (!profile) profile = this.currentProfile;
    let title = this.getProfile(profile).getTitle(doc);
    return title ? title : '- untitled -';
  }

  getIconClass(profile: string): string {
    return this.getProfile(profile).treeIconClass;
  }

  getFieldsNeededForTitle(): string[] {
    // TODO: refactor
    let fields: string[] = [];
    fields.push(
      ...this.uvpProfile.getTitleFields(),
      ...this.addressProfile.getTitleFields(),
      ...this.folderProfile.getTitleFields()
    );
    return fields;
  }

  requestFormValues(): any {
    let formData: any = {};
    this.formDataSubject.next(formData);
    return formData;
  }

  getSelectedDocuments(): string[] {
    let ids: string[] = [];
    this.selectedDocuments.next(ids);
    return ids;
  }
}
