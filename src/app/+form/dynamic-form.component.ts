import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormControlService } from '../services/form-control.service';
import { Container, FieldBase } from './controls';
import { BehaviourService } from '../+behaviours/behaviour.service';
import { FormularService } from '../services/formular/formular.service';
import { Behaviour } from '../+behaviours/behaviours';
import { FormToolbarService } from './toolbar/form-toolbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { ModalService } from '../services/modal/modal.service';
import { PartialGeneratorField } from './controls/field-partial-generator';
import { UpdateType } from '../models/update-type.enum';
import { ErrorService } from '../services/error.service';
import { ToastyConfig } from 'ng2-toasty';
import { Role } from '../models/user-role';
import { SelectedDocument } from './sidebars/selected-document.model';
import { KeycloakService } from '../keycloak/keycloak.service';
import { RoleService } from '../+user/role.service';
import { Subscription } from 'rxjs/Subscription';
import { WizardService } from '../wizard/wizard.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';

interface FormData extends Object {
  _id?: string;
  _parent?: string;
  taskId?: string;
  title?: string;
}

export interface FormDataContainer {
  form: any;
  fields: any;
  value: any;
}

@Component({
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
  providers: [FormControlService]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('newDocModal') newDocModal: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModal: TemplateRef<any>;
  @ViewChild('discardConfirmModal') discardConfirmModal: TemplateRef<any>;

  newDocModalRef: BsModalRef;

  debugEnabled = false;

  // when editing a folder this flag must be set
  // editMode: boolean = false;

  fields: FieldBase<any>[] = [];
  form: FormGroup = null;
  data: FormData = {};
  behaviours: Behaviour[];
  observers: Subscription[] = [];
  error = false;
  choiceNewDoc = 'UVP';
  addToDoc = false;
  sideTab = 'tree';
  showDateBar = false;

  hideSidebar = false;
  sidebarWidth = 25;

  markFavoriteHovered = false;
  wizardFocusElement = null;

  userRoles: Role[];

  // choice of doc types to be shown when creating new document
  newDocOptions: any = {
    docTypes: [],
    selectedDataset: {},
    rootOption: true
  };


  // the id to remember when dirty check was true
  // a modal will be shown and if changes shall be discarded then use this id to load dataset afterwards again
  pendingId: string;

  constructor( private messageService: MessageService, private toastyConfig: ToastyConfig,
              private modal2Service: BsModalService,
              private qcs: FormControlService, private behaviourService: BehaviourService,
              private formularService: FormularService, private formToolbarService: FormToolbarService,
              private storageService: StorageService, private modalService: ModalService,
              private roleService: RoleService,
              private wizardService: WizardService,
              private errorService: ErrorService, private route: ActivatedRoute, private router: Router) {

    // TODO: get roles definiton
    this.userRoles = KeycloakService.auth.roleMapping; // authService.rolesDetail;

    // KeycloakService.auth.authz.

    const loadSaveSubscriber = this.formToolbarService.getEventObserver().subscribe(eventId => {
      console.log('generic toolbar handler', eventId);
      if (eventId === 'SAVE') {
        this.save();
      } else if (eventId === 'NEW_DOC') {
        this.newDoc();
      }
    });

    this.formularService.selectedDocuments$.subscribe( data => {
      this.formToolbarService.setButtonState(
        'toolBtnSave',
        data.length === 1);
    } );

    this.observers.push(loadSaveSubscriber);

    this.behaviourService.initialized.then(() => {
      this.route.queryParams.subscribe(params => {
        this.debugEnabled = params['debug'] !== undefined;
        // this.editMode = params['editMode'] === "true";
        // this.load(thisid);
      });
      this.route.params.subscribe(params => this.load( params['id'] ) );
    });

    this.toastyConfig.theme = 'bootstrap';
  }

  ngOnDestroy() {
    console.log('destroy');
    this.observers.forEach(observer => observer.unsubscribe());
    this.behaviourService.behaviours
      .filter(behave => behave.isActive)
      .forEach(behave => behave.unregister());

    // reset selected documents if we revisit the page
    this.formularService.setSelectedDocuments([]);
  }

  // noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.formularService.currentProfile = null;

    this.wizardService.focusElements$.subscribe( fields => this.wizardFocusElement = fields );

    // register to an publisher in the form/storage service and send the value of this form
    // this can be used for publish, revert, detail, compare, ...
    this.observers.push(
      // return current form data on request
      this.formularService.formDataSubject$.subscribe( (container: FormDataContainer) => {
        container.form = this.form;
        container.fields = this.fields;
        container.value = {
          _id: this.data._id,
          _profile: this.formularService.currentProfile
        };

        // if form was already initialized then map values to the response
        if (this.form) {
          Object.assign(container.value, this.form.value);
        }
      }),

      // load dataset when one was updated
      this.storageService.datasetsChanged$.subscribe((msg) => {
        if (msg.data && msg.data.length === 1 && (msg.type === UpdateType.Update || msg.type === UpdateType.New)) {
          this.load( msg.data[0]._id );
        }
      })
    );
  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {
    // add form errors check when saving/publishing
    this.observers.push(
      this.storageService.beforeSave$.subscribe((message: any) => {
        message.errors.push({ invalid: this.form.invalid });
        console.log('in observer');
      })
    );
  }

  /*canDeactivate(component: DynamicFormComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
      W: Observable<DynamicFormComponent>|Promise<DynamicFormComponent>|boolean {
    console.log( 'can deactive (form)' );
    /!*if (this.form && this.form.dirty) {
      this.pendingId = null;
      this.discardConfirmModal.open();
      return false;
    }
    return true;*!/
    if (component.hasChanges()) {
      return window.confirm('Do you really want to cancel?');
    }
    return true;
  }*/

  @HostListener( 'window: keydown', ['$event'] )
  hotkeys(event: KeyboardEvent) {
    if (event.ctrlKey && event.keyCode === 83) { // CTRL + S (Save)
      console.log( 'SAVE' );
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      if (this.form) {
        this.save();
      }
    }
  }

  newDoc() {
    // let options = {
    //   availableTypes: this.formularService.docTypes,
    //   rootOption: true
    // };
    const selectedDocs = this.formularService.getSelectedDocuments();
    this.newDocOptions.docTypes = this.formularService.getDocTypes()
      .filter( type => type.id !== 'FOLDER')
      .sort( (a, b) => a.label.localeCompare(b.label));
    this.newDocOptions.selectedDataset = (selectedDocs && selectedDocs.length === 1) ? selectedDocs[0] : {};
    this.formularService.newDocumentSubject.next(this.newDocOptions);
    this.newDocModalRef = this.modal2Service.show(this.newDocModal);
  }

  prepareNewDoc() {
    const profile = this.choiceNewDoc;
    let previousId = null;
    const selectedDocs = this.formularService.getSelectedDocuments();
    if (selectedDocs.length === 1) {
      previousId = this.formularService.getSelectedDocuments()[0].id;
    }
    const needsProfileSwitch = this.formularService.currentProfile !== profile;

    if (this.form) {
      this.form.reset();
    }

    try {
      if (needsProfileSwitch) {
        this.switchProfile(profile);
      }

      this.data = {};
      if (this.addToDoc) {
        this.data._parent = previousId;
      }

      this.updateRepeatableFields(this.data);

      this.createFormWithData(this.data);

      this.behaviourService.apply(this.form, profile);
      // after profile switch inform the subscribers about it to recognize initial data set
      this.storageService.afterProfileSwitch.next(this.form.value);

      // notify browser/tree of new dataset
      const newDoc = { _profile: profile, _parent: this.data._parent };
      this.storageService.saveData( newDoc, true );

    } catch (ex) {
      console.error( 'Error adding new document: ', ex );
    }
    this.newDocModalRef.hide();
  }

  discardChanges() {
    // this.form.reset();
    this.load(this.pendingId);

    // this.discardConfirmModal.close();
  }

  handleSelection(selectedDocs: SelectedDocument[]) {
    this.formularService.setSelectedDocuments(selectedDocs);

    // when multiple nodes were selected then do not show any form
    if (this.form) {
      if (selectedDocs.length !== 1 && this.form.enabled) {
        this.form.disable();
      } else if (this.form.disabled) {
        this.form.enable();
      }
    }
  }

  handleLoad(selectedDocs: SelectedDocument[]) { // id: string, profile?: string, forceLoad?: boolean) {
    // when multiple nodes were selected then do not show any form
    if (selectedDocs.length !== 1) {
      return;
    }

    const doc = selectedDocs[0];

    // if a folder was selected then normally do not show the form
    // show folder form only if the edit button was clicked which adds the forceLoad option
    if (doc.profile === 'FOLDER' && !doc.editable) {
      return;
    }

    this.router.navigate( ['/form', {id: doc.id}]);
  }

  /**
   * Load a document and prepare the form for the data.
   * @param {string} id is the ID of document to be loaded
   * @param {string} previousId is the ID of the previous document in case we want to switch back!???
   */
  load(id: string, previousId?: string) {

    // since data always stays the same there's no change detection if we load the same data again
    // even if we already have changed the formular
    // since loading will be async, we only have to reset the data first


    // check if form was changed and ask for saving data
    // TODO: handle double confirmation (deactivated this one for now)
    /*if (false && this.form && this.form.dirty) {
      this.pendingId = id;
      this.discardConfirmModal.open();
      // TODO: notify sidebar to select previously dataset before we changed
      return;
    } else {*/

    // }

    // TODO: remove new dataset if not saved already -> we only want at most one new dataset at a time!

    if (id === undefined) {
        return;
    }

    this.storageService.loadData(id).subscribe(data => {
      console.log('loaded data:', data);

      // if (data._profile === 'FOLDER' && !this.editMode) return;

      const profile = data._profile;
      const needsProfileSwitch = this.formularService.currentProfile !== profile;
      this.data = data;

      try {

        // switch to the right profile depending on the data
        if (needsProfileSwitch) {
          this.switchProfile(profile);
        }

        this.updateRepeatableFields(data);

        this.createFormWithData(data);

        this.behaviourService.apply(this.form, profile);
        this.storageService.afterProfileSwitch.next(data);

        this.storageService.afterLoadAndSet.next(data);

      } catch (ex) {
        console.error( ex );
        this.modalService.showError(ex);
        this.data._id = id;
      }
    }, (err) => this.errorService.handle(err));
  }

  save() {
    console.log('valid:', this.form.valid);

    // let errors: string[] = [];
    // alert('This form is valid: ' + this.form.valid);
    const data = this.form.value;
    // attach profile type to data, which is not reflected in form directly by value
    data._id = this.data._id;
    data._parent = this.data._parent;
    data._profile = this.formularService.currentProfile;

    // during save the listeners for dataset changes are already called
    // this.form.reset(this.form.value);
    this.form.markAsPristine();

    this.storageService.saveData(data, false).then(res => {
      this.data._id = res._id;
      // this.messageService.show( 'Dokument wurde gespeichert' );
      this.messageService.add({severity: 'success', summary: 'Dokument wurde gespeichert'});
    }, (err: HttpErrorResponse) => {
      this.errorService.handleOwn(err.message, err.error)
      // setTimeout(() => this.error = false, 5000);
    });
  }

/*  showToast() {
        // Or create the instance of ToastOptions
    const toastOptions: ToastOptions = {
            title: 'Dokument wurde gespeichert',
            // msg: 'Dokument wurde gespeichert',
            showClose: false,
            timeout: 2000,
        };
        // Add see all possible types in one shot
        this.toastyService.info(toastOptions);
    }*/

  createFormWithData(data: any) {
    this.form = this.qcs.toFormGroup(this.fields, data);

    // disable form if we don't have the permission
    // delay a bit for form to be created
    // TODO: try to get permission beforehand and create form with this information
    setTimeout( () => this.hasPermission(data) ? this.form && this.form.enable() : this.form.disable(), 0);
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

  switchProfile(profile: string) {
    this.behaviourService.unregisterAll();
    this.fields = this.formularService.getFields(profile);

    // add controls from active behaviours
    // TODO: refactor to a function
    this.behaviours = this.behaviourService.behaviours;
    this.behaviours
      .filter(behave => behave.isActive && behave.forProfile === profile)
      .forEach((behave) => {
        if (behave.controls) {
          behave.controls.forEach((additionalField => {
            this.fields.push(additionalField);
          }));
        }
      });

    // TODO: introduce order by field IDs as an array to make it easier to squeeze in a new field
    //       => [ 'title', 'description', ... ]
    // sort fields by its order field
    this.fields.sort((a, b) => a.order - b.order).slice(0);

    this.formularService.currentProfile = profile;
  }

  updateRepeatableFields(data: any) {
    // set repeatable fields according to loaded data
    const repeatFields = this.fields.filter(pField => (<Container>pField).isRepeatable);

    repeatFields.forEach((repeatField: Container) => {
      this.resetArrayGroup(repeatField.key);
      if (data[repeatField.key]) {
        const repeatData = data[repeatField.key];
        for (let i = 0; i < repeatData.length; i++) {
          const partialKey = Object.keys(repeatData[i])[0];
          this.addArrayGroup(repeatField, partialKey);
        }
      }
    });
  }

  resetArrayGroup(name: string) {
    const group = <Container>this.fields.filter(f => (<Container>f).key === name)[0];

    // remove from definition fields
    while (group.children.length > 0) {
      group.children.pop();
    }
  }

  addArrayGroup(repeatField: any, key: string) {
    this.addPartialToField(repeatField, key);
  }

  addPartialToField(field: any, partialKey: string): any {
    const partial = field.partials.filter( (part: any) => part.key === partialKey )[0];
    const clonedPartial = Object.assign({}, partial);
    field.children.push(clonedPartial);
    return partial;
  }

  addPartialToForm(partial: any, formArray: FormArray, data: any) {
    const additionalFormGroup = this.qcs.toFormGroup([partial], data);
    additionalFormGroup.setParent(formArray);
    formArray.controls.push(additionalFormGroup);
  }

  addSection(data: any) {
    // use target-key or similar to have no conflicts with other fields with same name
    const field = <PartialGeneratorField>this.fields.filter(f => (<Container>f).key === data.key)[0];
    const partial = this.addPartialToField(field, data.section);
    const formArray = <FormArray>this.form.controls[data.key];
    this.addPartialToForm(partial, formArray, {});
  }

  getTitle() {
    // console.log( '.' );
    return this.formularService.getTitle(null, this.data);
  }

  markFavorite($event: Event) {
    // TODO: mark favorite
    $event.stopImmediatePropagation();
    console.log('TODO: Mark document as favorite');
  }

}
