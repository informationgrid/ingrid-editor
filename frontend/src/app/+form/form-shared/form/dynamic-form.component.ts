/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Signal,
  signal,
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
import {
  FormlyFieldConfig,
  FormlyFormOptions,
  FormlyModule,
} from "@ngx-formly/core";
import { FormularService } from "../../formular.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { catchError, debounceTime, filter, map, tap } from "rxjs/operators";
import {
  combineLatest,
  fromEvent,
  merge,
  Observable,
  Subscription,
} from "rxjs";
import { TreeService } from "../../sidebars/tree/tree.service";
import { FormStateService } from "../../form-state.service";
import { HttpErrorResponse } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { FormMessageService } from "../../../services/form-message.service";
import { ConfigService } from "../../../services/config/config.service";
import { TranslocoService } from "@jsverse/transloco";
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
import { GeneralStore } from "../../../store/general.store";
import { toObservable } from "@angular/core/rxjs-interop";
import { ProfileService } from "../../../services/profile.service";
import { UiStore } from "../../../store/ui.store";
import { BehaviourService } from "../../../services/behavior/behaviour.service";

@UntilDestroy()
@Component({
  selector: "ige-form-wrapper",
  templateUrl: "./dynamic-form.component.html",
  styleUrls: ["./dynamic-form.component.scss"],
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

  private generalStore = inject(GeneralStore);
  private profileService = inject(ProfileService);
  private uiStore = inject(UiStore);
  private behaviourService = inject(BehaviourService);

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
      metadata: null,
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

  // @ts-ignore
  model: IgeDocument = {};

  metadata = this.formStateService.metadata;

  paddingWithHeader: string;

  showAllFields: Signal<boolean> = this.uiStore.toggleFieldsButtonShowAll;

  hasOptionalFields = false;

  isLoading = true;

  showJson: Signal<boolean> = computed(() => {
    const plugin = this.behaviourService.getBehaviour("plugin.show.json");
    return plugin.isActive && this.uiStore.showJSONView();
  });

  private readonly: boolean;
  private loadSubscription: Subscription[] = [];
  showBlocker = signal<boolean>(false);
  isStickyHeader = false;
  numberOfErrors = 0;
  showValidationErrors = false;
  private errorCounterSubscription: Subscription;

  private waitForCodelistsLoaded$ = toObservable(
    this.generalStore.codelistsLoaded,
  );
  private waitForDoctypesLoaded$ = toObservable(
    this.generalStore.doctypesLoaded,
  );

  constructor(
    private formularService: FormularService,
    private formToolbarService: FormToolbarService,
    private documentService: DocumentService,
    private modalService: ModalService,
    private messageService: FormMessageService,
    public formStateService: FormStateService,
    private treeService: TreeService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private docEvents: DocEventsService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
  ) {
    this.sidebarWidth = this.uiStore.sidebarWidth();

    effect(() => {
      const serverValidationErrors = this.generalStore.serverValidationErrors();
      if (serverValidationErrors.length > 0) {
        serverValidationErrors.forEach((error) => {
          console.error("Received server side validation error", error);
          const message = this.translocoService.translate(
            `form.validationMessages.${error.errorCode}`,
          );
          this.form.get(error.name)?.setErrors([{ message: message }]);
        });
        this.numberOfErrors = serverValidationErrors.length;
      }
    });

    effect(() => {
      this.isLoading = this.generalStore.isDocumentLoading();
    });

    effect(() => {
      const activeNode = this.generalStore.explicitActiveNode();
      // execute only ofter init, otherwise initial loading of dataset will not work
      if (activeNode === null) return;

      if (activeNode.id === null) {
        // when clicking on root node in breadcrumb we need to set opened document to null
        // otherwise the last one will be loaded again
        this.documentService.updateOpenedDocumentInTreestore(
          null,
          this.address,
        );
        this.router.navigate([
          ConfigService.catalogId + (this.address ? "/address" : "/form"),
        ]);
      }
    });
  }

  ngOnDestroy() {
    this.formularService.currentDoctypeId = null;

    // reset selected documents if we revisit the page
    this.formularService.setSelectedDocuments([], this.address);
  }

  ngOnInit() {
    // wait for doctypes and codelists to be loaded before opening first dataset
    combineLatest([
      this.waitForDoctypesLoaded$.pipe(filter((isLoaded) => isLoaded === true)),
      this.waitForCodelistsLoaded$.pipe(
        filter((isLoaded) => isLoaded === true),
      ),
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

    this.formularService.currentDoctypeId = null;

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
  }

  // noinspection JSUnusedGlobalSymbols
  scrollHeaderOffsetLeft: number;

  ngAfterViewInit(): any {
    // show blocker div to prevent user from modifying data or calling functions
    // during save
    this.docEvents
      .beforeSave$(this.address)
      .subscribe(() => this.showBlocker.set(true));

    // reset dirty flag after save
    this.docEvents.afterSave$(this.address).subscribe((data) => {
      this.formStateService.updateMetadata(data.metadata);
      // TODO AW: do not update form data after save, since metadata is enough
      this.updateFormWithData(data);
    });

    this.documentService.documentOperationFinished$
      .pipe(untilDestroyed(this))
      .subscribe((finished) => this.showBlocker.set(!finished));

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
    this.readonly =
      !doc.hasWritePermission ||
      doc._state === "PENDING" ||
      DocumentService.isDocumentArchived(doc._tags);
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
    const scrollPosition = this.uiStore.scrollPosition();
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

    const doctype = data.metadata.docType;

    if (doctype === null) {
      throw new Error("Dieses Dokument hat keinen Dokumententyp!");
    }

    try {
      if (this.needDoctypeSwitch(doctype)) {
        this.handleDoctypeSwitch(doctype);
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

      this.documentService.setDocLoadingState(false);
    } catch (ex) {
      console.error(ex);
      this.modalService.showJavascriptError(ex);
    }
  }

  private needDoctypeSwitch(doctypeId: string): boolean {
    return (
      this.fields.length === 0 ||
      this.formularService.currentDoctypeId !== doctypeId
    );
  }

  private handleDoctypeSwitch(doctypeId: string) {
    this.formStateService.unobserveTextareaHeights();

    // switch to the right doctype depending on the data
    this.fields = this.switchDoctype(doctypeId);

    this.formStateService.restoreAndObserveTextareaHeights(this.fields);

    this.formularService.getSectionsForDoctype(this.fields);
    this.hasOptionalFields =
      this.profileService.getDoctype(doctypeId).hasOptionalFields;
  }

  /**
   *
   * @param doctypeId
   */
  private switchDoctype(doctypeId: string): FormlyFieldConfig[] {
    this.formularService.currentDoctypeId = doctypeId;

    return this.formularService.getFields(doctypeId);
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
      metadata: this.metadata(),
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
