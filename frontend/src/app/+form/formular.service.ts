import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DocumentAbstract} from '../store/document/document.model';
import {Profile} from '../services/formular/profile';
import {HttpErrorResponse} from '@angular/common/http';
import {ProfileService} from '../services/profile.service';
import {DocumentService} from '../services/document/document.service';
import {TreeQuery} from '../store/tree/tree.query';
import {TreeStore} from '../store/tree/tree.store';
import {SessionStore} from '../store/session.store';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {IFieldBase} from './controls';
import {FormGroup} from '@angular/forms';
import {CreateDocOptions, NewDocumentComponent} from './dialogs/new-document/new-document.component';
import {IgeDocument} from '../models/ige-document';
import {FormMessageService} from './form-info/form-message/form-message.service';

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

  constructor(private dialog: MatDialog,
              private profiles: ProfileService,
              private documentService: DocumentService,
              private formMessageService: FormMessageService,
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

  handleToolbarEvents(eventId: string, form: FormGroup) {
    console.log('generic toolbar handler', eventId);
    if (eventId === 'SAVE') {
      this.save(form);
    } else if (eventId === 'NEW_DOC') {
      this.newDoc();
    }
  }

  save(form: FormGroup) {
    this.documentService.publishState$.next(false);

    form.markAsPristine();

    this.saveForm(form.value);
  }

  private saveForm(data: IgeDocument, isNewDoc= false) {
    this.documentService.save(data, isNewDoc).then(() => {
      this.formMessageService.sendInfo('Ihre Eingabe wurde gespeichert');
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

    let parent = null;
    if (addBelowDoc) {
      parent = this.treeQuery.getActive()[0].id;
    }

    const newDoc = new IgeDocument(type, parent);

    this.saveForm(newDoc, true);

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
