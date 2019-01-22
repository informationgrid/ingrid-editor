import {Injectable} from '@angular/core';
import {IFieldBase} from '../../+form/controls';
import {Profile} from './profile';
import {SelectedDocument} from '../../+form/sidebars/selected-document.model';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../config/config.service';
import {ProfileService} from '../profile.service';
import {Observable, Subject} from 'rxjs';
import {ProfileQuery} from "../../store/profile/profile.query";

@Injectable({
  providedIn: 'root'
})
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

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService, private profiles: ProfileService, profileQuery: ProfileQuery) {
    this.configuration = configService.getConfiguration();

    // create profiles after we have logged in

    console.log('init profiles');

    profileQuery.isInitialized$.subscribe((isInitialized) => {
      if (isInitialized) {
        this.profileDefinitions = profiles.getProfiles();
      }
    });
  }

  getFields(profile: string) {
    let fields: IFieldBase<any>[];

    fields = this.getProfile(profile).fields;

    this.currentProfile = profile;

    // return a copy of our fields (immutable data!)
    return fields.sort((a, b) => a.order - b.order).slice(0);
  }

  getProfile(id: string): Profile {
    if (this.profileDefinitions) {
      const profile = this.profileDefinitions.find(p => p.id === id);
      if (!profile) {
        // throw Error('Unknown profile: ' + id);
        console.error('Unknown profile: ' + id);
        return null;
      }
      return profile;
    } else {
      return null;
    }
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

    // return unique items in array
    return fields.filter((x, i, a) => x && a.indexOf(x) === i);
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

  getDocTypes(): { id: string, label: string }[] {
    return this.profileDefinitions.map(profile => ({id: profile.id, label: profile.label}));
  }
}
