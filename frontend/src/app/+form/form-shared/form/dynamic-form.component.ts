/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from "@angular/forms";
import { FormToolbarService } from "../toolbar/form-toolbar.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { ModalService } from "../../../services/modal/modal.service";
import {
  DocumentWithMetadata,
  IgeDocument,
} from "../../../models/ige-document";
import { FormUtils } from "../../form.utils";
import { TreeQuery } from "../../../store/tree/tree.query";
import {
  FormlyFieldConfig,
  FormlyFormOptions,
  FormlyModule,
} from "@ngx-formly/core";
import { SessionQuery } from "../../../store/session.query";
import { FormularService } from "../../formular.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { catchError, debounceTime, filter, map, tap } from "rxjs/operators";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import {
  combineLatest,
  fromEvent,
  merge,
  Observable,
  Subscription,
} from "rxjs";
import { ProfileQuery } from "../../../store/profile/profile.query";
import { Behaviour } from "../../../services/behavior/behaviour";
import { TreeService } from "../../sidebars/tree/tree.service";
import { ValidationError } from "../../../store/session.store";
import { FormStateService } from "../../form-state.service";
import { HttpErrorResponse } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { CodelistQuery } from "../../../store/codelist/codelist.query";
import { FormMessageService } from "../../../services/form-message.service";
import { ConfigService } from "../../../services/config/config.service";
import { TranslocoService } from "@ngneat/transloco";
import { IgeError } from "../../../models/ige-error";
import { FormToolbarComponent } from "../toolbar/form-toolbar.component";
import { AngularSplitModule } from "angular-split";
import { SidebarComponent } from "../../sidebars/sidebar.component";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { FormInfoComponent } from "../../form-info/form-info.component";
import { QuickNavbarComponent } from "./quick-navbar/quick-navbar.component";
import { FolderDashboardComponent } from "../folder/folder-dashboard.component";
import { AsyncPipe, JsonPipe } from "@angular/common";

@UntilDestroy()
@Component({
  selector: "ige-form-wrapper",
  templateUrl: "./dynamic-form.component.html",
  styleUrls: ["./dynamic-form.component.scss"],
  standalone: true,
  imports: [
    FormToolbarComponent,
    AngularSplitModule,
    SidebarComponent,
    CdkScrollable,
    MatProgressSpinner,
    FormInfoComponent,
    QuickNavbarComponent,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule,
    FolderDashboardComponent,
    AsyncPipe,
    JsonPipe,
  ],
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() address = false;

  @ViewChild("scrollForm", { read: ElementRef }) scrollForm: ElementRef;
  @ViewChild("formInfo", { read: ElementRef }) formInfoRef: ElementRef;

  sidebarWidth: number;

  fields: FormlyFieldConfig[] = [];

  // noinspection JSUnusedGlobalSymbols
  formOptions: FormlyFormOptions = {
    showError: (field) => {
      return this.showValidationErrors && field.formControl?.invalid;
    },
    formState: {
      disabled: true,
      updateModel: () => {
        this.model = { ...this.model };
        this.formOptions.formState.mainModel = this.model;
      },
    },
  };

  sections: Observable<string[]> = this.formularService.sections$;

  form = new UntypedFormGroup({});

  // initial model for form info header
  formInfoModel: any = null;

  behaviours: Behaviour[];
  error = false;
  // @ts-ignore
  model: IgeDocument = {};

  metadata = this.formStateService.metadata;

  paddingWithHeader: string;

  showValidationErrors = false;

  showAllFields = this.session.select(
    (state) => state.ui.toggleFieldsButtonShowAll,
  );

  hasOptionalFields = false;

  private query: TreeQuery | AddressTreeQuery;
  isLoading = true;
  showJson = false;
  private readonly: boolean;
  private loadSubscription: Subscription[] = [];
  showBlocker = false;
  isStickyHeader = false;
  numberOfErrors = 0;
  private errorCounterSubscription: Subscription;

  constructor(
    private formularService: FormularService,
    private formToolbarService: FormToolbarService,
    private documentService: DocumentService,
    private modalService: ModalService,
    private messageService: FormMessageService,
    public formStateService: FormStateService,
    private treeService: TreeService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private session: SessionQuery,
    private profileQuery: ProfileQuery,
    private codelistQuery: CodelistQuery,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private docEvents: DocEventsService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
  ) {
    this.sidebarWidth = this.session.getValue().ui.sidebarWidth;
  }

  ngOnDestroy() {
    this.formularService.currentProfile = null;

    // reset selected documents if we revisit the page
    this.formularService.setSelectedDocuments([]);
  }

  ngOnInit() {
    if (this.address) {
      this.query = this.addressTreeQuery;
    } else {
      this.query = this.treeQuery;
    }

    this.query
      .select("isDocLoading")
      .pipe(untilDestroyed(this))
      .subscribe((state) => (this.isLoading = state));

    // wait for profile and codelists to be loaded before opening first dataset
    combineLatest([
      this.profileQuery.selectLoading().pipe(filter((isLoading) => !isLoading)),
      this.codelistQuery
        .selectLoading()
        .pipe(filter((isLoading) => !isLoading)),
      merge(
        this.route.params.pipe(map((param) => param.id)),
        this.documentService.reload$.pipe(
          filter((item) => item.forAddress === this.address),
          map((item) => item.uuid),
          // when we revisit this page, make sure to update the form in our service
          // so that other plugins access the current one
          tap(() => this.formStateService.updateForm(this.form)),
        ),
      ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe((params) => this.loadDocument(params[2]));

    this.formularService.currentProfile = null;

    this.documentService.publishState$
      .pipe(untilDestroyed(this))
      .subscribe((doPublish) => {
        this.numberOfErrors = 0;
        if (doPublish) {
          this.showValidationErrors = true;
          this.form.markAllAsTouched();
          // @ts-ignore
          this.form._updateTreeValidity({ emitEvent: true });
        } else {
          this.showValidationErrors = false;
          // @ts-ignore
          this.form._updateTreeValidity({ emitEvent: true });
        }
      });

    const showFormDashboard$ = this.query.explicitActiveNode$.pipe(
      untilDestroyed(this),
      filter(
        (node) => node !== undefined && (node === null || node.id === null),
      ),
    );

    showFormDashboard$.subscribe(() => {
      // when clicking on root node in breadcrumb we need to set opened document to null
      // otherwise the last one will be loaded again
      this.documentService.updateOpenedDocumentInTreestore(null, this.address);
      this.router.navigate([
        ConfigService.catalogId + (this.address ? "/address" : "/form"),
      ]);
    });

    this.handleJsonViewPlugin();

    this.handleServerSideValidationErrors();
  }

  private handleJsonViewPlugin() {
    this.session.showJSONView$
      .pipe(untilDestroyed(this))
      .subscribe((show) => (this.showJson = show));
  }

  private handleServerSideValidationErrors() {
    // handle server validation errors
    // 1) wait for server publish validation errors
    // 2) set error on control

    this.session.selectServerValidationErrors$
      .pipe(
        untilDestroyed(this),
        filter((errors) => errors.length > 0),
      )
      .subscribe((errors: ValidationError[]) => {
        this.showValidationErrors = true;
        errors.forEach((error) => {
          console.error("Received server side validation error", error);
          const message = this.translocoService.translate(
            `form.validationMessages.${error.errorCode}`,
          );
          this.form.get(error.name)?.setErrors([{ message: message }]);
        });
        this.numberOfErrors = errors.length;
      });
  }

  // noinspection JSUnusedGlobalSymbols
  scrollHeaderOffsetLeft: number;

  ngAfterViewInit(): any {
    // show blocker div to prevent user from modifying data or calling functions
    // during save
    this.docEvents
      .beforeSave$(this.address)
      .subscribe(() => (this.showBlocker = true));

    // reset dirty flag after save
    this.docEvents.afterSave$(this.address).subscribe((data) => {
      this.formStateService.updateMetadata(data.metadata);
      // TODO AW: do not update form data after save, since metadata is enough
      this.updateFormWithData(data);
    });

    this.documentService.documentOperationFinished$
      .pipe(untilDestroyed(this))
      .subscribe((finished) => (this.showBlocker = !finished));

    this.initScrollBehavior();
  }

  @HostListener("window: keydown", ["$event"])
  hotkeys(event: KeyboardEvent) {
    FormUtils.addHotkeys(event, this.formToolbarService, this.readonly);
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeUnloadHandler(event: Event) {
    if (this.form?.dirty) {
      event.returnValue = false;
    }
  }

  private initScrollBehavior() {
    const element = this.scrollForm.nativeElement;
    fromEvent(element, "scroll")
      .pipe(
        untilDestroyed(this),
        // debounceTime(10), // do not handle all events
        filter((_) => this.formInfoRef !== undefined),
        map((): boolean => this.determineToggleState(element.scrollTop)),
        tap((show) => this.toggleStickyHeader(show)),
        debounceTime(300), // update store less frequently
        tap(() =>
          this.treeService.updateScrollPositionInStore(
            this.address,
            element.scrollTop,
          ),
        ),
      )
      .subscribe();
  }

  private determineToggleState(top: number) {
    // when we scroll more than the non-sticky area then it should become sticky
    return top > this.formInfoRef.nativeElement.clientHeight;
  }

  private toggleStickyHeader(show: boolean) {
    this.isStickyHeader = show;
  }

  /**
   * Load a document and prepare the form for the data.
   * @param {string} id is the ID of document to be loaded
   */
  loadDocument(id: string) {
    this.showValidationErrors = false;
    this.numberOfErrors = 0;
    let previousDocUuid = this.form.value._uuid;

    if (id === undefined) {
      this.resetForm();
      return;
    }

    // clear potential messages from previous document
    this.messageService.clearMessages();

    this.updateScrollPosition();

    if (this.loadSubscription.length > 0) {
      this.loadSubscription.forEach((subscription) =>
        subscription.unsubscribe(),
      );
      this.loadSubscription = [];
    }

    const loadSubscription = this.documentService
      .load(id, this.address, true, true)
      .pipe(
        untilDestroyed(this),
        filter((doc) => doc != null),
        tap((doc) => this.formStateService.updateMetadata(doc.metadata)),
        tap((doc) => this.handleReadOnlyState(doc.documentWithMetadata)),
        tap((doc) =>
          this.treeService.selectTreeNode(this.address, doc.metadata.wrapperId),
        ),
        tap((doc) =>
          this.loadSubscription.push(
            this.updateBreadcrumb(doc.metadata.wrapperId),
          ),
        ),
        catchError((error: HttpErrorResponse) =>
          this.handleLoadError(error, previousDocUuid),
        ),
      )
      .subscribe((doc: DocumentWithMetadata) => this.updateFormWithData(doc));

    this.loadSubscription.push(loadSubscription);
  }

  private handleReadOnlyState(doc: IgeDocument) {
    this.readonly = !doc.hasWritePermission || doc._state === "PENDING";
  }

  private updateBreadcrumb(id: number) {
    return this.documentService.updateBreadcrumb(id, this.address);
  }

  private handleLoadError(
    error: HttpErrorResponse,
    previousDocUuid: string,
  ): Observable<any> {
    if (error.status === 403) {
      // select previous document
      const target =
        ConfigService.catalogId + (this.address ? "/address" : "/form");
      const commands: any[] = [target];
      if (previousDocUuid) commands.push({ id: previousDocUuid });

      this.router.navigate(commands);
    } else if (error.status === 404) {
      throw new IgeError("Der Datensatz konnte nicht gefunden werden");
    }
    throw error;
  }

  private updateScrollPosition() {
    // form might not be available on first visit
    setTimeout(() => (this.scrollForm.nativeElement.scrollTop = 0));
    const scrollPosition = this.query.getValue().scrollPosition;
    if (scrollPosition !== 0) {
      setTimeout(
        () => (this.scrollForm.nativeElement.scrollTop = scrollPosition),
        500,
      );
    }
  }

  private resetForm() {
    this.fields = [];
    this.treeService.selectTreeNode(this.address, null);
    this.form.reset();
    this.documentService.updateOpenedDocumentInTreestore(
      null,
      this.address,
      true,
    );
  }

  private updateFormWithData(data: DocumentWithMetadata) {
    if (data === null) {
      return;
    }

    const profile = data.metadata.docType;

    if (profile === null) {
      throw new Error("Dieses Dokument hat keinen Dokumententyp!");
    }

    try {
      if (this.needProfileSwitch(profile)) {
        this.handleProfileSwitch(profile);
        // make sure to create a new form to prevent data coming from another
        // form type into the new form
        this.createNewForm();

        // make sure to reset the model before detecting changes, so that the old
        // data is not included in the new form
        // @ts-ignore
        this.model = {};
        this.formInfoModel = null;

        // do change detection to update formly component with new fields and form
        this.cdr.detectChanges();
      }

      this.formOptions.resetModel(data.document);
      this.model = data.document;
      this.prepareForm(data.metadata.hasWritePermission && !this.readonly);

      this.formInfoModel = { ...this.model };

      this.documentService.setDocLoadingState(false, this.address);
    } catch (ex) {
      console.error(ex);
      this.modalService.showJavascriptError(ex);
    }
  }

  private needProfileSwitch(profile: string): boolean {
    return (
      this.fields.length === 0 ||
      this.formularService.currentProfile !== profile
    );
  }

  private handleProfileSwitch(profile: string) {
    this.formStateService.unobserveTextareaHeights();

    // switch to the right profile depending on the data
    this.fields = this.switchProfile(profile);

    this.formStateService.restoreAndObserveTextareaHeights(this.fields);

    this.formularService.getSectionsFromProfile(this.fields);
    this.hasOptionalFields =
      this.profileQuery.getProfile(profile).hasOptionalFields;
  }

  /**
   *
   * @param profile
   */
  private switchProfile(profile: string): FormlyFieldConfig[] {
    this.formularService.currentProfile = profile;

    return this.formularService.getFields(profile);
  }

  rememberSizebarWidth(info: any) {
    this.formularService.updateSidebarWidth(info.sizes[0]);
  }

  private prepareForm(writePermission: boolean) {
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formOptions.formState = {
      ...this.formOptions.formState,
      disabled: !writePermission,
      mainModel: this.model,
    };
  }

  async handleDrop(event: any) {
    let handled = await FormUtils.handleDirtyForm(
      this.formStateService,
      this.documentService,
      this.dialog,
      this.address,
    );

    if (!handled) {
      return;
    }
    this.documentService
      .move(event.srcIds, event.destination, this.address, true)
      .subscribe();
  }

  private createNewForm() {
    this.errorCounterSubscription?.unsubscribe();

    // create new form group since it can become corrupted, probably because of page caching
    // load address -> load doc and save -> open address -> load doc and save modified again -> old document state is written
    this.form = new UntypedFormGroup({});

    this.errorCounterSubscription = this.form.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(500),
        filter(() => this.showValidationErrors),
      )
      .subscribe(() => {
        const invalidFields = this.getInvalidControlNames(this.form);
        if (invalidFields.length > 0)
          console.warn("INVALID FIELDS: ", invalidFields);
        this.numberOfErrors = invalidFields.length;
      });

    // update form here instead of onInit, because of caching problem, where no onInit method is called
    // after revisiting the page
    this.formStateService.updateForm(this.form);
  }

  private getInvalidControlNames(input: FormGroup | FormArray): string[] {
    let invalidControlNames: string[] = [];
    Object.keys(input.controls).forEach((controlName) => {
      const control = input.get(controlName)!;
      if (control.invalid && control instanceof FormControl) {
        invalidControlNames.push(controlName);
      } else if (
        control.invalid &&
        (control instanceof FormGroup || control instanceof FormArray)
      ) {
        const invalidControls = this.getInvalidControlNames(control);
        if (invalidControls.length === 0) {
          invalidControlNames.push(controlName);
        } else {
          invalidControlNames.push(...this.getInvalidControlNames(control));
        }
      }
    });
    return invalidControlNames;
  }
}
