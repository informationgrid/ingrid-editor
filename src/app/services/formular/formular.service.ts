import {Inject, Injectable} from '@angular/core';
import {FieldBase} from '../../+form/controls';
import {Profile, PROFILES} from './profile';
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
  selectedDocs: SelectedDocument[] = [];

  // an observer to subscribe to, when reacting on newly selected documents
  selectedDocuments = new Subject<SelectedDocument[]>();
  selectedDocuments$: Observable<SelectedDocument[]> = this.selectedDocuments.asObservable();

  profileDefinitions: Profile[];

  constructor(@Inject(PROFILES) private profiles: Profile[]) {
    // create profiles after we have logged in
    const init = () => {
      this.profileDefinitions = profiles
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
    const profile = this.profileDefinitions.find( profile => profile.id === id);
    if (!profile) {
      // throw Error('Unknown profile: ' + id);
      console.error('Unknown profile: ' + id);
      return null;
    }
    return profile;
  }

  getTitle(profile: string, doc: any) {
    if (!profile) {
      profile = this.currentProfile;
    }
    const profileVal = this.getProfile(profile);
    const title = profileVal ? profileVal.getTitle(doc) : '- unknown profile -';
    return title ? title : this.untitledLabel;
  }

  getIconClass(profile: string): string {
    const profileVal = this.getProfile(profile);
    return profileVal ? profileVal.treeIconClass : 'xxx';
  }

  getFieldsNeededForTitle(): string[] {
    const fields: string[] = [];
    this.profileDefinitions.forEach(profile => fields.push(...profile.getTitleFields()));
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

  getDocTypes(): {id: string, label: string}[] {
    return this.profileDefinitions.map( profile => ({id: profile.id, label: profile.label}) );
  }
}
