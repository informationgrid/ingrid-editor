import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormToolbarService} from '../toolbar/form-toolbar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentService} from '../../../services/document/document.service';
import {ModalService} from '../../../services/modal/modal.service';
import {Role} from '../../../models/user-role';
import {IgeDocument} from '../../../models/ige-document';
import {FormUtils} from '../../form.utils';
import {TreeQuery} from '../../../store/tree/tree.query';
import {FormlyFieldConfig, FormlyFormOptions} from '@ngx-formly/core';
import {SessionQuery} from '../../../store/session.query';
import {FormularService} from '../../formular.service';
import {FormPluginsService} from '../form-plugins.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {StickyHeaderInfo} from '../../form-info/form-info.component';
import {filter, map} from 'rxjs/operators';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {BehaviorSubject, combineLatest, merge} from 'rxjs';
import {ProfileQuery} from '../../../store/profile/profile.query';
import {Behaviour} from '../../../services/behavior/behaviour';
import {NgFormsManager} from '@ngneat/forms-manager';
import {AuthService} from "../../../services/security/auth.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@UntilDestroy()
@Component({
  selector: 'ige-form-wrapper',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentChecked {

  @Input() address = false;

  @ViewChild('scrollForm', {read: ElementRef}) scrollForm: ElementRef;

  activeId = new BehaviorSubject<string>(null);
  sidebarWidth: number;

  fields: FormlyFieldConfig[] = [];

  formOptions: FormlyFormOptions = {
    formState: {
      forPublish: false
    }
  };

  sections: string[];

  form = new FormGroup({});

  behaviours: Behaviour[];
  error = false;
  model: IgeDocument | any = {};

  userRoles: Role[];

  paddingWithHeader: string;

  showValidationErrors = false;

  hasOptionalFields = new BehaviorSubject<boolean>(false);

  private formStateName: 'document' | 'address';
  private query: TreeQuery | AddressTreeQuery;
  isLoading = true;
  showJson = false;

  constructor(private formularService: FormularService, private formToolbarService: FormToolbarService,
              private formPlugins: FormPluginsService,
              private documentService: DocumentService, private modalService: ModalService,
              private formsManager: NgFormsManager,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private session: SessionQuery,
              private profileQuery: ProfileQuery,
              private router: Router,
              private auth: AuthService,
              private route: ActivatedRoute) {

    // TODO: get roles definiton
    this.userRoles = [];

    this.sidebarWidth = this.session.getValue().ui.sidebarWidth;

  }

  ngOnDestroy() {
    this.formularService.currentProfile = null;

    // reset selected documents if we revisit the page
    this.formularService.setSelectedDocuments([]);
    this.formsManager.unsubscribe();
  }

  ngOnInit() {
    this.formsManager.valueChanges(this.address ? 'address' : 'document').subscribe(() => this.auth.refreshSession().subscribe())

    if (this.address) {
      this.formPlugins.setAddressConfiguration();
      this.formStateName = 'address';
      this.query = this.addressTreeQuery;
    } else {
      this.formStateName = 'document';
      this.query = this.treeQuery;
    }

    this.query.select('isDocLoading')
      .pipe(untilDestroyed(this))
      .subscribe(state => this.isLoading = state);

    combineLatest([
      this.profileQuery.selectLoading()
        .pipe(filter(isLoading => !isLoading)),
      merge(
        this.route.params.pipe(map(param => param.id)),
        this.documentService.reload$
      )
    ])
      .pipe(untilDestroyed(this))
      .subscribe(params => this.loadDocument(params[1]));

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

    const showFormDashboard$ = this.query.explicitActiveNode$
      .pipe(
        untilDestroyed(this),
        filter(node => node !== undefined && (node === null || node.id === null))
      );

    const externalTreeNodeChange$ = this.query.explicitActiveNode$
      .pipe(
        untilDestroyed(this),
        filter(node => node !== undefined && node !== null)
      );

    showFormDashboard$.subscribe(() => {
      this.documentService.updateOpenedDocumentInTreestore(null, this.address);
      this.router.navigate([this.address ? '/address' : '/form']);
    });

    // only activate tree node (when rejecting unsaved changes dialog)
    externalTreeNodeChange$.subscribe(node => {
      this.activeId.next(node.id);
    });

    this.session.showJSONView$
      .pipe(untilDestroyed(this))
      .subscribe(show => this.showJson = show);

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
      .subscribe(data => this.updateFormWithData(data));
  }

  @HostListener('window: keydown', ['$event'])
  hotkeys(event: KeyboardEvent) {
    FormUtils.addHotkeys(event, this.formToolbarService);
  }


  ngAfterContentChecked() {
    // TODO check if performance is impacted
    this.hasOptionalFields.next(document.querySelectorAll('.optional').length < 1)
  }

  /**
   * Load a document and prepare the form for the data.
   * @param {string} id is the ID of document to be loaded
   */
  loadDocument(id: string) {

    if (id === undefined) {
      const previousOpenedDoc = this.query.getValue().openedDocument;
      if (previousOpenedDoc) {
        this.documentService.setDocLoadingState(true, this.address);
        console.log('Opening previous selected node', previousOpenedDoc.id);
        id = previousOpenedDoc.id.toString();
        setTimeout(() => this.scrollForm.nativeElement.scrollTop = this.treeQuery.getValue().scrollPosition, 1000);
      } else {
        this.fields = [];
        this.formsManager.destroy(this.formStateName);
        this.activeId.next(null);
        this.documentService.updateOpenedDocumentInTreestore(null, this.address, true);
        return;
      }
    } else {
      setTimeout(() => this.scrollForm.nativeElement.scrollTop = 0);
    }

    this.showValidationErrors = false;

    // set activeId delayed in case of page initialization explicitActiveNode$ observable
    // comes a bit later
    setTimeout(() => this.activeId.next(id));

    this.documentService.load(id, this.address)
      .pipe(untilDestroyed(this))
      .subscribe(doc => this.updateFormWithData(doc));
  }

  private updateFormWithData(data) {

    if (data === null) {
      return;
    }

    const profile = data._type;

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
      this.documentService.setDocLoadingState(false, this.address);

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
  private switchProfile(profile: string): FormlyFieldConfig[] {
    this.formularService.currentProfile = profile;

    return this.formularService.getFields(profile);
  }

  private markFavorite($event: Event) {
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

    // FIXME: form does not seem to be updated automatically and we have to force update event
    this.formsManager.upsert(this.formStateName, this.form);
  }

  handleDrop(event: any) {
    this.documentService.move(event.srcIds, event.destination, this.address, true).subscribe();
  }

  toggleOptionals($event: MatSlideToggleChange) {
    if ($event.checked) {
      document.querySelectorAll('.optional').forEach((e) => {
        e.classList.remove('hidden')
      })
    } else {
      document.querySelectorAll('.optional').forEach((e) => {
        e.classList.add('hidden')
      })
    }
  }
}
