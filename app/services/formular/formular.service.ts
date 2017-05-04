import {Injectable} from '@angular/core';
import {FieldBase} from '../../+form/controls';
import {FolderProfile} from './folder/folder.profile';
import {UVPProfile} from './uvp/uvp.profile';
import {AddressProfile} from './address/address.profile';
import {Observable, Subject, Subscription} from 'rxjs';
import {Profile} from './profile';
import {CodelistService} from '../../+form/services/codelist.service';
import {AuthService} from '../security/auth.service';

@Injectable()
export class FormularService {

  untitledLabel = '- untitled -';

  data = {};

  currentProfile: string;

  formDataSubject = new Subject<any>();
  formDataSubject$ = this.formDataSubject.asObservable();

  newDocumentSubject = new Subject<any>();
  newDocumentSubject$ = this.newDocumentSubject.asObservable();

  selectedDocuments = new Subject<string[]>();
  selectedDocuments$: Observable<string[]> = this.selectedDocuments.asObservable();

  addressProfile: Profile;
  uvpProfile: Profile;
  folderProfile: Profile;

  docTypes = [
    {id: 'UVP', label: 'UVP'},
    // {id: 'ISO', label: 'ISO'},
    {id: 'ADDRESS', label: 'Address'},
    {id: 'FOLDER', label: 'Folder'}
  ];

  constructor(private codelistService: CodelistService, authService: AuthService) {
    // create profiles after we have logged in
    let init = () => {
      this.addressProfile = new AddressProfile();
      this.uvpProfile = new UVPProfile(this.codelistService);
      this.folderProfile = new FolderProfile();
    };

    console.log("init profiles");
    if (authService.loggedIn()) {
      init();
    } else {
      let loginSubscriber = authService.loginStatusChange$.subscribe( loggedIn => {
        if (loggedIn) {
          init();
          console.log("Finished init profiles");
          loginSubscriber.unsubscribe();
        }
      } );
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
    return title ? title : this.untitledLabel;
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
    this.
      .next(ids);
    return ids;
  }
}
