import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormControlService} from '../services/form-control.service';
import {BehaviourService} from '../services/behavior/behaviour.service';
import {FormularService} from '../services/formular/formular.service';
import {Behaviour} from '../+behaviours/behaviours';
import {FormToolbarService} from './toolbar/form-toolbar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentService} from '../services/document/document.service';
import {ModalService} from '../services/modal/modal.service';
import {ErrorService} from '../services/error.service';
import {Role} from '../models/user-role';
import {RoleService} from '../services/role/role.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {NewDocumentComponent} from '../dialogs/form/new-document/new-document.component';
import {DocumentQuery} from '../store/document/document.query';
import {IgeDocument} from '../models/ige-document';
import {takeUntil} from 'rxjs/operators';
import {DocumentStore} from '../store/document/document.store';
import {FormUtils} from './form.utils';
import {TreeQuery} from '../store/tree/tree.query';
import {McloudFormly} from '../formly/profiles/mcloud.formly';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {CodelistService} from '../services/codelist/codelist.service';
import {AkitaNgFormsManager} from '@datorama/akita-ng-forms-manager';

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

@Component( {
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [FormControlService]
  // changeDetection: ChangeDetectionStrategy.OnPush
} )
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild( 'newDocModal', {static: true} ) newDocModal: TemplateRef<any>;
  @ViewChild( 'deleteConfirmModal', {static: true} ) deleteConfirmModal: TemplateRef<any>;
  @ViewChild( 'discardConfirmModal', {static: true} ) discardConfirmModal: TemplateRef<any>;

  // TODO: the width of the sidebar can be stored in a cookie/localstorage
  sidebarWidth = 15;

  debugEnabled = false;

  // when editing a folder this flag must be set
  // editMode: boolean = false;

  fields: FormlyFieldConfig[] = [];

  form: FormGroup = new FormGroup({
    title: new FormControl('Kein Titel')
  });
  data: IgeDocument|any = {};
  behaviours: Behaviour[];
  error = false;
  model: any = {};

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
  private currentDocument$: Observable<IgeDocument>;
  private componentDestroyed: Subject<void> = new Subject();
  private formUtils: FormUtils;

  constructor(private qcs: FormControlService, private behaviourService: BehaviourService,
              private formularService: FormularService, private formToolbarService: FormToolbarService,
              private documentService: DocumentService, private modalService: ModalService,
              private dialog: MatDialog,
              private formsManager: AkitaNgFormsManager<any>,
              private roleService: RoleService,
              private documentQuery: DocumentQuery,
              private treeQuery: TreeQuery,
              private documentStore: DocumentStore,
              private codelistService: CodelistService,
              private errorService: ErrorService, private route: ActivatedRoute, private router: Router) {

    // TODO: get roles definiton
    this.userRoles = []; // KeycloakService.auth.roleMapping; // authService.rolesDetail;
    this.formUtils = new FormUtils();
    // KeycloakService.auth.authz.

    // handle toolbar events
    this.formToolbarService.getEventObserver()
      // .pipe(takeUntil(this.componentDestroyed))
      .subscribe( eventId => {
        console.log( 'generic toolbar handler', eventId );
        if (eventId === 'SAVE') {
          this.save();
        } else if (eventId === 'NEW_DOC') {
          this.newDoc();
        }
      } );

    // react on document selection
    this.treeQuery.selectActiveId().pipe(takeUntil(this.componentDestroyed)).subscribe((activeDocs) => {
      this.formToolbarService.setButtonState(
        'toolBtnSave',
        activeDocs && activeDocs.length === 1 );
    } );

    this.behaviourService.initialized.then( () => {
      /*this.route.queryParams.subscribe( params => {
        this.debugEnabled = params['debug'] !== undefined;
        // this.editMode = params['editMode'] === 'true';
        // this.load(thisid);
      } );*/
      this.route.params.subscribe( params => {
        this.load( params['id'] );
      } );
    } );
  }

  ngOnDestroy() {
    console.log( 'destroy' );
    this.formularService.currentProfile = null;
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
    this.behaviourService.behaviours
      .filter( behave => behave.isActive && behave.unregister )
      .forEach( behave => behave.unregister() );

    // reset selected documents if we revisit the page
    this.formularService.setSelectedDocuments( [] );
    this.formsManager.unsubscribe();
  }

  // noinspection JSUnusedGlobalSymbols
  ngOnInit() {

    this.formsManager.upsert('document', this.form);

    this.documentQuery.openedDocument$.pipe(takeUntil(this.componentDestroyed)).subscribe(data => {
        console.log( 'loaded data:', data );

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
        this.data = data;
        try {

          // switch to the right profile depending on the data
          if (needsProfileSwitch) {
            this.switchProfile( profile );
          }

          this.model = {...data};
          this.form.markAsPristine();
          /*this.updateRepeatableFields( data );

          this.createFormWithData( data );

          this.behaviourService.apply( this.form, profile );*/
          // this.documentService.afterProfileSwitch.next( data );

          // this.documentService.afterLoadAndSet.next( data );

        } catch (ex) {
          console.error( ex );
          this.modalService.showJavascriptError( ex );
          // this.data._id = id;
        }
      }
      // , (err) => this.errorService.handle( err )
    );

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
    /*this.documentService.datasetsChanged$
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe( (msg) => {
        if (msg.data && msg.data.length === 1 && (msg.type === UpdateType.Update || msg.type === UpdateType.New)) {
          this.load( <string>msg.data[0].id );
        }
      } );*/
  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {
    // add form errors check when saving/publishing
    this.documentService.beforeSave$
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe( (message: any) => {
        message.errors.push( {invalid: this.form.invalid} );
        console.log( 'in observer' );
      } );
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
    this.formUtils.addHotkeys(event, this);
  }

  newDoc() {
    // let options = {
    //   availableTypes: this.formularService.docTypes,
    //   rootOption: true
    // };
    const selectedDocs = this.treeQuery.getActive();
    this.newDocOptions.docTypes = this.formularService.getDocTypes()
      .filter( type => type.id !== 'FOLDER' )
      .sort( (a, b) => a.label.localeCompare( b.label ) );

    this.newDocOptions.selectedDataset = (selectedDocs && selectedDocs.length === 1) ? selectedDocs[0] : {};
    this.formularService.newDocumentSubject.next( this.newDocOptions );

    const dlg = this.dialog.open( NewDocumentComponent, {
      data:
        {
          docTypes: this.newDocOptions.docTypes,
          rootOption: this.newDocOptions.rootOption,
          choice: null
        }
    } );
    dlg.afterClosed().subscribe( result => {
      if (result) {
        this.prepareNewDoc(result.choice, result.addBelowDoc);
      }
    })
  }

  prepareNewDoc(type: string, addBelowDoc: boolean) {
    /*let previousId = null;
    const selectedDocs = this.treeQuery.getActive();
    if (selectedDocs && selectedDocs.length === 1) {
      previousId = selectedDocs[0].id;
    }
    const needsProfileSwitch = this.formularService.currentProfile !== type;

    if (this.form) {
      this.form.reset();
    }*/
    this.form = new FormGroup({});
    this.formsManager.upsert('document', this.form);
    this.model = {};

    this.fields = new McloudFormly(null, this.codelistService).fields;

    // TODO: use constructor for creating new document
    const newDoc = {_profile: type, _parent: this.data._parent ? this.data._parent : null};
    this.documentService.save( newDoc, true );

    return;

    /*try {
      if (needsProfileSwitch) {
        this.switchProfile( type );
      }

      this.data = {};
      if (addBelowDoc) {
        this.data._parent = previousId;
      }

      this.updateRepeatableFields( this.data );

      this.createFormWithData( this.data );

      this.behaviourService.apply( this.form, type );
      // after type switch inform the subscribers about it to recognize initial data set
      this.documentService.afterProfileSwitch.next( this.form.value );

      // notify browser/tree of new dataset
      // TODO: use constructor for creating new document
      const newDoc = {_profile: type, _parent: this.data._parent ? this.data._parent : null};
      this.documentService.save( newDoc, true );

    } catch (ex) {
      console.error( 'Error adding new document: ', ex );
    }*/
  }

  discardChanges() {
    // this.form.reset();
    this.load( this.pendingId );

    // this.discardConfirmModal.close();
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

    this.documentService.load( id ).subscribe();
  }

  save() {
    console.log( 'valid:', this.form.valid );

    // let errors: string[] = [];
    // alert('This form is valid: ' + this.form.valid);
    const data = this.model; // this.form.value;

    // during save the listeners for dataset changes are already called
    // this.form.reset(this.form.value);
    this.form.markAsPristine();

    this.documentService.save( data, false ).then(res => {
      this.documentStore.setOpenedDocument(res);
      // TODO: this.treeStore.upsert
      // this.data._id = res._id;
      // this.messageService.show( 'Dokument wurde gespeichert' );
      // TODO: this.messageService.add({severity: 'success', summary: 'Dokument wurde gespeichert'});
    }, (err: HttpErrorResponse) => {
      // this.errorService.handleOwn( err.message, err.error );
      // setTimeout(() => this.error = false, 5000);
      throw err;
    } );
  }

  // TODO: extract to permission service class
  hasPermission(data: any): boolean {
    // TODO: check all roles
    if (this.userRoles.length > 0) {
      const attr = this.userRoles[0].attributes;
      const docIDs = this.userRoles[0].datasets.map( dataset => dataset.id );
      // TODO: show why we don't have permission by remembering failed rule
      const permissionByAttribute = !attr || attr.every( a => data[a.id] === a.value );
      const permissionByDatasetId = !docIDs || docIDs.length === 0 || docIDs.some( id => data._id === id );

      return permissionByAttribute && permissionByDatasetId;
    }
    // TODO: implement correct permission handling
    return true;
  }

  switchProfile(profile: string) {
    // this.behaviourService.unregisterAll();

    // @ts-ignore
    this.fields = this.formularService.getFields( profile );



    // add controls from active behaviours
    // TODO: refactor to a function
    /*this.behaviours = this.behaviourService.behaviours;
    this.behaviours
      .filter( behave => behave.isActive && behave.forProfile === profile )
      .forEach( (behave) => {
        if (behave.controls) {
          behave.controls.forEach( (additionalField => {
            this.fields.push( additionalField );
          }) );
        }
      } );

    // TODO: introduce order by field IDs as an array to make it easier to squeeze in a new field
    //       => [ 'title', 'description', ... ]
    // sort fields by its order field
    // @ts-ignore
    this.fields.sort( (a, b) => a.order - b.order ).slice( 0 );*/

    this.formularService.currentProfile = profile;
  }

  markFavorite($event: Event) {
    // TODO: mark favorite
    $event.stopImmediatePropagation();
    console.log( 'TODO: Mark document as favorite' );
  }

}
