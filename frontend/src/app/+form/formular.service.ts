import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DocumentAbstract} from '../store/document/document.model';
import {Profile} from '../services/formular/profile';
import {ConfigService, Configuration} from '../services/config/config.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ProfileService} from '../services/profile.service';
import {ProfileQuery} from '../store/profile/profile.query';
import {DocumentService} from '../services/document/document.service';
import {TreeQuery} from '../store/tree/tree.query';
import {TreeStore} from '../store/tree/tree.store';
import {SessionStore} from '../store/session.store';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {IFieldBase} from './controls';
import {FormGroup} from '@angular/forms';
import {CreateDocOptions, NewDocumentComponent} from './dialogs/new-document/new-document.component';
import {IgeDocument} from '../models/ige-document';

@Injectable()
export class FormularService {

  // choice of doc types to be shown when creating new document
  newDocOptions: any = {
    docTypes: [],
    selectedDataset: {},
    rootOption: true
  };

  data = {};

  currentProfile: string;

  profileDefinitions: Profile[];

  private configuration: Configuration;

  constructor(private http: HttpClient,
              private dialog: MatDialog,
              configService: ConfigService,
              private profiles: ProfileService,
              profileQuery: ProfileQuery,
              private documentService: DocumentService,
              private treeQuery: TreeQuery,
              private treeStore: TreeStore,
              private sessionStore: SessionStore) {

    // this.formPluginsService = new FormPluginsService();

    this.configuration = configService.getConfiguration();

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
      fields = nextProfile.fields.slice(0);

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

  handleToolbarEvents(eventId: string, form) {
    console.log('generic toolbar handler', eventId);
    if (eventId === 'SAVE') {
      this.save(form);
    } else if (eventId === 'NEW_DOC') {
      this.newDoc();
    }
  }

  save(form: FormGroup) {
    console.log('valid:', form.valid);

    form.markAsPristine();

    this.documentService.save(form.value, false).then(() => {
      // TODO: this.messageService.add({severity: 'success', summary: 'Dokument wurde gespeichert'});
    }, (err: HttpErrorResponse) => {
      throw err;
    });
  }

  newDoc() {
    // let options = {
    //   availableTypes: this.formularService.docTypes,
    //   rootOption: true
    // };
    const selectedDocs = this.treeQuery.getActive();
    this.newDocOptions.docTypes = this.getDocTypes()
      .filter(type => type.id !== 'FOLDER')
      .sort((a, b) => a.label.localeCompare(b.label));

    this.newDocOptions.selectedDataset = (selectedDocs && selectedDocs.length === 1) ? selectedDocs[0] : {};

    const dlg = this.dialog.open(NewDocumentComponent, {
      data:
        {
          docTypes: this.newDocOptions.docTypes,
          rootOption: this.newDocOptions.rootOption,
          parent: this.newDocOptions.selectedDataset,
          choice: null
        }
    });
    dlg.afterClosed().subscribe((result: CreateDocOptions) => {
      if (result) {
        this.prepareNewDoc(result.choice, result.addBelowDoc);
      }
    })
  }

  /**
   * Create a new document and save it in the backend.
   * @param type
   * @param addBelowDoc
   */
  prepareNewDoc(type: string, addBelowDoc: boolean) {

    /*this.form = new FormGroup({});
    this.formsManager.upsert('document', this.form);
    this.model = {};*/

    let parent = null;
    if (addBelowDoc) {
      parent = this.treeQuery.getActive()[0].id;
    }

    // TODO: use constructor for creating new document
    const newDoc = new IgeDocument(type, parent);
    this.documentService.save(newDoc, true);

    return;

  }


  /**
   *
   * @Deprecated
   */
  getTitle(profile: string, doc: IgeDocument) {
    return doc.title;
  }

  getIconClass(profile: string): string {
    const profileVal = this.getProfile(profile);
    return profileVal ? profileVal.treeIconClass : 'xxx';
  }

  setSelectedDocuments(docs: DocumentAbstract[]) {
    this.treeStore.setActive(docs.map(d => d.id));
  }

  getSelectedDocuments(): DocumentAbstract[] {
    return this.treeQuery.getActive();
    // return this.treeQuery.selectedDocuments;
    // return this.selectedDocs;
  }

  getDocTypes(): { id: string, label: string }[] {
    return this.profileDefinitions.map(profile => ({id: profile.id, label: profile.label}));
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
