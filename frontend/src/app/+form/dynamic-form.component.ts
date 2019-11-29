import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormControlService} from '../services/form-control.service';
import {BehaviourService} from '../services/behavior/behaviour.service';
import {Behaviour} from '../+behaviours/behaviours';
import {FormToolbarService} from './toolbar/form-toolbar.service';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '../services/document/document.service';
import {ModalService} from '../services/modal/modal.service';
import {ErrorService} from '../services/error.service';
import {Role} from '../models/user-role';
import {RoleService} from '../services/role/role.service';
import {MatDialog} from '@angular/material/dialog';
import {DocumentQuery} from '../store/document/document.query';
import {IgeDocument} from '../models/ige-document';
import {DocumentStore} from '../store/document/document.store';
import {FormUtils} from './form.utils';
import {TreeQuery} from '../store/tree/tree.query';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {CodelistService} from '../services/codelist/codelist.service';
import {AkitaNgFormsManager} from '@datorama/akita-ng-forms-manager';
import {UpdateType} from '../models/update-type.enum';
import {SessionQuery} from '../store/session.query';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {FormularService} from './formular.service';
import {FormPluginsService} from './form-plugins.service';

@Component({
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [FormControlService, FormPluginsService]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {

  sidebarWidth = 15;

  fields: FormlyFieldConfig[] = [];

  form: FormGroup = new FormGroup({
    title: new FormControl('Kein Titel')
  });

  behaviours: Behaviour[];
  error = false;
  model: IgeDocument | any = {};

  userRoles: Role[];

  private formUtils: FormUtils;

  constructor(private qcs: FormControlService, private behaviourService: BehaviourService,
              private formularService: FormularService, private formToolbarService: FormToolbarService,
              private formPlugins: FormPluginsService,
              private documentService: DocumentService, private modalService: ModalService,
              private dialog: MatDialog,
              private formsManager: AkitaNgFormsManager,
              private roleService: RoleService,
              private documentQuery: DocumentQuery,
              private treeQuery: TreeQuery,
              private session: SessionQuery,
              private documentStore: DocumentStore,
              private codelistService: CodelistService,
              private errorService: ErrorService, private route: ActivatedRoute) {

    // TODO: get roles definiton
    this.userRoles = []; // KeycloakService.auth.roleMapping; // authService.rolesDetail;
    this.formUtils = new FormUtils();

    // handle toolbar events
    this.formToolbarService.toolbarEvent$
      .pipe(untilDestroyed(this))
      .subscribe(eventId => this.formularService.handleToolbarEvents(eventId, this.form, this.model));

    // react on document selection
    this.treeQuery.selectActiveId()
      .pipe(untilDestroyed(this))
      .subscribe((activeDocs) => {
      this.formToolbarService.setButtonState(
        'toolBtnSave',
        activeDocs && activeDocs.length === 1);

      // do not allow to modify form if multiple nodes have been selected in tree
      activeDocs.length === 1 ? this.form.enable() : this.form.disable();

    });

    this.behaviourService.initialized.then(() => {
      this.route.params.subscribe(params => {
        this.loadDocument(params['id']);
      });
    });

    this.sidebarWidth = this.session.getValue().ui.sidebarWidth;

  }

  ngOnDestroy() {
    console.log('destroy');
    this.formularService.currentProfile = null;
    this.behaviourService.behaviours
      .filter(behave => behave.isActive && behave.unregister)
      .forEach(behave => behave.unregister());

    // reset selected documents if we revisit the page
    this.formularService.setSelectedDocuments([]);
    this.formsManager.unsubscribe();
  }

  ngOnInit() {


    this.formsManager.upsert('document', this.form);

    /*this.documentQuery.openedDocument$.pipe(takeUntil(this.componentDestroyed)).subscribe(data => {
      }
    );*/

    this.formularService.currentProfile = null;

    // this.wizardService.focusElements$.subscribe( fields => this.wizardFocusElement = fields );

    // register to an publisher in the form/storage service and send the value of this form
    // this can be used for publish, revert, detail, compare, ...
    // return current form data on request
    /*this.formularService.formDataSubject$
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe( (container: FormDataContainer) => {
        container.form = this.form;
        container.fields = this.fields;
        container.value = {
          _id: this.data._id,
          _profile: this.formularService.currentProfile
        };

        // if form was already initialized then map values to the response
        if (this.form) {
          Object.assign( container.value, this.form.value );
        }
      } );*/


    // load dataset when one was updated
    this.documentService.datasetsChanged$
      .pipe(untilDestroyed(this))
      .subscribe((msg) => {
        if (msg.data && msg.data.length === 1 && (msg.type === UpdateType.Update || msg.type === UpdateType.New)) {
          const id = <string>msg.data[0].id;
          this.loadDocument(id);
        }
      });
  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {
    // add form errors check when saving/publishing
    this.documentService.beforeSave$
      .pipe(untilDestroyed(this))
      .subscribe((message: any) => {
        message.errors.push({invalid: this.form.invalid});
        console.log('in observer');
      });
  }

  @HostListener('window: keydown', ['$event'])
  hotkeys(event: KeyboardEvent) {
    this.formUtils.addHotkeys(event, this.formularService, this.form, this.model);
  }


  /**
   * Load a document and prepare the form for the data.
   * @param {string} id is the ID of document to be loaded
   */
  loadDocument(id: string) {

    if (id === undefined) {
      return;
    }

    this.documentService.load(id)
      .subscribe(
        doc => this.updateFormWithData(doc),
        error => console.error('Could not load document', error));
  }

  updateFormWithData(data) {
    console.log('loaded data:', data);

    if (data === null) {
      return;
    }

    // this.documentService.beforeLoad.next();

    // if (data._profile === 'FOLDER' && !this.editMode) return;

    const profile = data._profile;

    if (profile === null) {
      console.error('This document does not have any profile');
      return;
    }

    const needsProfileSwitch = this.formularService.currentProfile !== profile;
    // this.data = data;
    try {

      // switch to the right profile depending on the data
      if (needsProfileSwitch) {
        this.switchProfile(profile);
      }

      this.model = {...data};
      this.form.markAsPristine();

    } catch (ex) {
      console.error(ex);
      this.modalService.showJavascriptError(ex);
    }
  }

  // TODO: extract to permission service class
  hasPermission(data: any): boolean {
    // TODO: check all roles
    if (this.userRoles.length > 0) {
      const attr = this.userRoles[0].attributes;
      const docIDs = this.userRoles[0].datasets.map(dataset => dataset.id);
      // TODO: show why we don't have permission by remembering failed rule
      const permissionByAttribute = !attr || attr.every(a => data[a.id] === a.value);
      const permissionByDatasetId = !docIDs || docIDs.length === 0 || docIDs.some(id => data._id === id);

      return permissionByAttribute && permissionByDatasetId;
    }
    // TODO: implement correct permission handling
    return true;
  }

  /**
   *
   * @param profile
   */
  switchProfile(profile: string) {
    this.fields = this.formularService.getFields(profile);

    this.formularService.currentProfile = profile;
  }

  markFavorite($event: Event) {
    // TODO: mark favorite
    $event.stopImmediatePropagation();
    console.log('TODO: Mark document as favorite');
  }

  rememberSizebarWidth(info) {
    console.log('Sizebar width: ', info);
    this.formularService.updateSidebarWidth(info.sizes[0]);
  }
}
