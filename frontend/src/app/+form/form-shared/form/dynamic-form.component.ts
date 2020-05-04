import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Behaviour} from '../../../+behaviours/behaviours';
import {FormToolbarService} from '../toolbar/form-toolbar.service';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '../../../services/document/document.service';
import {ModalService} from '../../../services/modal/modal.service';
import {ErrorService} from '../../../services/error.service';
import {Role} from '../../../models/user-role';
import {RoleService} from '../../../services/role/role.service';
import {MatDialog} from '@angular/material/dialog';
import {IgeDocument} from '../../../models/ige-document';
import {FormUtils} from '../../form.utils';
import {TreeQuery} from '../../../store/tree/tree.query';
import {FormlyFieldConfig, FormlyFormOptions} from '@ngx-formly/core';
import {CodelistService} from '../../../services/codelist/codelist.service';
import {AkitaNgFormsManager} from '@datorama/akita-ng-forms-manager';
import {SessionQuery} from '../../../store/session.query';
import {FormularService} from '../../formular.service';
import {FormPluginsService} from '../form-plugins.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {StickyHeaderInfo} from '../../form-info/form-info.component';

@UntilDestroy()
@Component({
  selector: 'ige-form-wrapper',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() address = false;

  sidebarWidth = 15;

  fields: FormlyFieldConfig[] = [];

  formOptions: FormlyFormOptions = {
    formState: {
      forPublish: false
    }
  };

  sections: string[];

  form: FormGroup = new FormGroup({});

  behaviours: Behaviour[];
  error = false;
  model: IgeDocument | any = {};

  userRoles: Role[];

  paddingWithHeader: string;

  private formUtils: FormUtils;
  showValidationErrors = false;

  private formStateName: 'document' | 'address';

  constructor(private formularService: FormularService, private formToolbarService: FormToolbarService,
              private formPlugins: FormPluginsService,
              private documentService: DocumentService, private modalService: ModalService,
              private dialog: MatDialog,
              private formsManager: AkitaNgFormsManager,
              private roleService: RoleService,
              private treeQuery: TreeQuery,
              private session: SessionQuery,
              private codelistService: CodelistService,
              private errorService: ErrorService, private route: ActivatedRoute) {

    // TODO: get roles definiton
    this.userRoles = []; // KeycloakService.auth.roleMapping; // authService.rolesDetail;
    this.formUtils = new FormUtils();

    this.sidebarWidth = this.session.getValue().ui.sidebarWidth;

  }

  ngOnDestroy() {
    this.formularService.currentProfile = null;

    // reset selected documents if we revisit the page
    this.formularService.setSelectedDocuments([]);
    this.formsManager.unsubscribe();
  }

  ngOnInit() {

    if (this.address) {
      this.formPlugins.setAddressConfiguration();
      this.formStateName = 'address';
    } else {
      this.formStateName = 'document';
    }

    // FIXME: use combineLatest to wait for profiles initialized
    //        otherwise document cannot be loaded correctly, since profile not yet initialized
    //        this.session.isProfilesInitialized$
    this.route.params
      .pipe(untilDestroyed(this))
      .subscribe(params => {
        this.loadDocument(params['id']);
      });

    this.formularService.currentProfile = null;

    this.documentService.publishState$
      .pipe(untilDestroyed(this))
      .subscribe(doPublish => {
        if (doPublish) {
          this.showValidationErrors = true;
          this.form.markAllAsTouched();
        } else {
          this.showValidationErrors = false;
        }
      });

    // load dataset when one was updated
    /*this.documentService.datasetsChanged$
      .pipe(untilDestroyed(this))
      .subscribe((msg) => {
        if (msg.data && msg.data.length === 1 && (msg.type === UpdateType.Update || msg.type === UpdateType.New)) {
          const id = <string>msg.data[0].id;
          this.loadDocument(id);
        }
      });*/

  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {

    // add form errors check when saving/publishing
    this.documentService.beforePublish$
      .pipe(untilDestroyed(this))
      .subscribe((message: any) => {
        message.errors.push({invalid: this.form.invalid});
      });

    // reset dirty flag after save
    this.documentService.afterSave$
      .pipe(untilDestroyed(this))
      .subscribe((message: any) => this.resetForm());
  }

  @HostListener('window: keydown', ['$event'])
  hotkeys(event: KeyboardEvent) {
    this.formUtils.addHotkeys(event, this.documentService, this.form);
  }

  /**
   * Load a document and prepare the form for the data.
   * @param {string} id is the ID of document to be loaded
   */
  loadDocument(id: string) {

    if (id === undefined) {
      this.fields = [];
      this.documentService.updateOpenedDocumentInTreestore(null, false);
      return;
    }

    this.documentService.load(id, this.address)
      .pipe(untilDestroyed(this))
      .subscribe(doc => this.updateFormWithData(doc));
  }

  updateFormWithData(data) {

    if (data === null) {
      return;
    }

    const profile = data._profile;

    if (profile === null) {
      console.error('This document does not have any profile');
      return;
    }

    const needsProfileSwitch = this.fields.length === 0 || this.formularService.currentProfile !== profile;

    try {

      // switch to the right profile depending on the data
      this.form = new FormGroup({});
      this.formsManager.upsert(this.formStateName, this.form);
      if (needsProfileSwitch) {
        this.fields = this.switchProfile(profile);
        this.sections = this.formularService.getSectionsFromProfile(this.fields);
      }

      this.model = {...data};
      this.resetForm();

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
  switchProfile(profile: string): FormlyFieldConfig[] {
    this.formularService.currentProfile = profile;

    return this.formularService.getFields(profile);
  }

  markFavorite($event: Event) {
    // TODO: mark favorite
    $event.stopImmediatePropagation();
    console.log('TODO: Mark document as favorite');
  }

  rememberSizebarWidth(info) {
    this.formularService.updateSidebarWidth(info.sizes[0]);
  }

  updateContentPadding(stickyHeaderInfo: StickyHeaderInfo) {
    this.paddingWithHeader = stickyHeaderInfo.show
      ? (stickyHeaderInfo.headerHeight + 20) + 'px'
      : 20 + 'px';
  }

  private resetForm() {
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

}
