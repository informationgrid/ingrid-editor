import {Injectable} from '@angular/core';
import {FieldBase} from '../../+form/controls';
import {FolderProfile} from './folder/folder.profile';
import {UVPProfile} from './uvp/uvp.profile';
import {AddressProfile} from './address/address.profile';
import {Profile} from './profile';
import {CodelistService} from '../../+form/services/codelist.service';
import {SelectedDocument} from '../../+form/sidebars/selected-document.model';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {KeycloakService} from '../../keycloak/keycloak.service';

@Injectable()
export class FormularService {

  untitledLabel = '- untitled -';

  data = {};

  currentProfile: string;

  formDataSubject = new Subject<any>();
  formDataSubject$ = this.formDataSubject.asObservable();

  // an observer when a new document is created
  newDocumentSubject = new Subject<any>();
  newDocumentSubject$ = this.newDocumentSubject.asObservable();

  // the currently selected documents from the tree or browser
  selectedDocs: SelectedDocument[];

  // an observer to subscribe to, when reacting on newly selected documents
  selectedDocuments = new Subject<SelectedDocument[]>();
  selectedDocuments$: Observable<SelectedDocument[]> = this.selectedDocuments.asObservable();

  addressProfile: Profile;
  uvpProfile: Profile;
  folderProfile: Profile;

  docTypes = [
    {id: 'UVP', label: 'UVP'},
    // {id: 'ISO', label: 'ISO'},
    {id: 'ADDRESS', label: 'Address'},
    {id: 'FOLDER', label: 'Folder'}
  ];

  constructor(private codelistService: CodelistService) {
    // create profiles after we have logged in
    const init = () => {
      this.addressProfile = new AddressProfile();
      this.uvpProfile = new UVPProfile(this.codelistService);
      this.folderProfile = new FolderProfile();
    };

    console.log('init profiles');

    if (KeycloakService.auth.loggedIn) {
      init();
    }
  }

  getFields(profile: string) {
    let fields: FieldBase<any>[];

    fields = this.getProfile(profile).profile;

    this.currentProfile = profile;

    // return a copy of our fields (immutable data!)
    return fields.sort((a, b) => a.order - b.order).slice(0);
  }

  getProfile(id: string): Profile {
    let profile: any = null;
    if (id === 'UVP') {
      profile = this.uvpProfile;
    } else if (id === 'ADDRESS') {
      profile = this.addressProfile;
    } else if (id === 'FOLDER') {
      profile = this.folderProfile;
    } else {
      throw Error('Unknown profile: ' + id);
    }
    return profile;
  }

  getTitle(profile: string, doc: any) {
    if (!profile) {
      profile = this.currentProfile;
    }
    const title = this.getProfile(profile).getTitle(doc);
    return title ? title : this.untitledLabel;
  }

  getIconClass(profile: string): string {
    return this.getProfile(profile).treeIconClass;
  }

  getFieldsNeededForTitle(): string[] {
    // TODO: refactor
    const fields: string[] = [];
    fields.push(
      ...this.uvpProfile.getTitleFields(),
      ...this.addressProfile.getTitleFields(),
      ...this.folderProfile.getTitleFields()
    );
    return fields;
  }

  requestFormValues(): any {
    const formData: any = {};
    this.formDataSubject.next(formData);
    return formData;
  }

  setSelectedDocuments(docs: SelectedDocument[]) {
    this.selectedDocs = docs;
    this.selectedDocuments.next(docs);
  }

  getSelectedDocuments(): SelectedDocument[] {
    return this.selectedDocs;
  }
}
