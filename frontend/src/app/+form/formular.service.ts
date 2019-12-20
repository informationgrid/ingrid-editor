import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DocumentAbstract} from '../store/document/document.model';
import {Profile} from '../services/formular/profile';
import {ProfileService} from '../services/profile.service';
import {DocumentService} from '../services/document/document.service';
import {TreeQuery} from '../store/tree/tree.query';
import {TreeStore} from '../store/tree/tree.store';
import {SessionStore} from '../store/session.store';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {IFieldBase} from './controls';
import {MessageService} from '../services/message.service';

@Injectable()
export class FormularService {

  data = {};

  currentProfile: string;

  profileDefinitions: Profile[];

  constructor(private dialog: MatDialog,
              private profiles: ProfileService,
              private documentService: DocumentService,
              private formMessageService: MessageService,
              private treeQuery: TreeQuery,
              private treeStore: TreeStore,
              private sessionStore: SessionStore) {

    // create profiles after we have logged in
    console.log('init profiles');
    this.profiles.initialized
      .then(registeredProfiles => this.profileDefinitions = registeredProfiles)
      .then(() => console.log('Profiles: ', this.profileDefinitions));

  }

  getFields(profile: string): FormlyFieldConfig[] {
    let fields: IFieldBase<any>[];

    const nextProfile = this.getProfile(profile);

    if (nextProfile) {
      fields = nextProfile.getFields().slice(0);

      this.currentProfile = profile;

      // return a copy of our fields (immutable data!)
      return fields.sort((a, b) => a.order - b.order);
    } else {
      throw new Error('Document type not found: ' + profile);
    }
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

  getIconClass(profile: string): string {
    const profileVal = this.getProfile(profile);
    return profileVal ? profileVal.iconClass : 'xxx';
  }

  setSelectedDocuments(docs: DocumentAbstract[]) {
    this.treeStore.setActive(docs.map(d => d.id));
  }

  getSelectedDocuments(): DocumentAbstract[] {
    return this.treeQuery.getActive();
    // return this.treeQuery.selectedDocuments;
    // return this.selectedDocs;
  }

  updateSidebarWidth(size: number) {
    this.sessionStore.update(state => ({
      ui: {
        ...state.ui,
        sidebarWidth: size
      }
    }))
  }
}
