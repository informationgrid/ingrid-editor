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
  APP_INITIALIZER,
  enableProdMode,
  ErrorHandler,
  importProvidersFrom,
  LOCALE_ID,
} from "@angular/core";

import { ConfigLoader } from "./app/config.loader";
import { environment } from "./environments/environment";
import { enableAkitaProdMode, persistState } from "@datorama/akita";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
  withXsrfConfiguration,
} from "@angular/common/http";
import { ConfigService } from "./app/services/config/config.service";
import { AuthenticationFactory } from "./app/security/auth.factory";
import { Router, RouteReuseStrategy } from "@angular/router";
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialog,
  MatDialogModule,
} from "@angular/material/dialog";
import { TranslocoService } from "@ngneat/transloco";
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import { GermanDateAdapter } from "./app/services/german-date.adapter";
import { AuthInterceptor } from "./app/security/keycloak/auth.interceptor";
import { SessionTimeoutInterceptor } from "./app/services/session-timeout.interceptor";
import { GlobalErrorHandler } from "./app/error-handler";
import { CustomReuseStrategy, routing } from "./app/app.router";
import { FlowInjectionToken, NgxFlowModule } from "@flowjs/ngx-flow";
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from "@angular/material/snack-bar";
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipModule,
} from "@angular/material/tooltip";
import { RxStompService } from "./app/rx-stomp.service";
import { rxStompServiceFactory } from "./app/rx-stomp-service-factory";
import { FORMLY_CONFIG, FormlyModule } from "@ngx-formly/core";
import { registerTranslateExtension } from "./app/formly/translate.extension";
import { pluginProvider } from "./app/plugin.provider";
import { AkitaNgDevtools } from "@datorama/akita-ngdevtools";
import { KeycloakAngularModule } from "keycloak-angular";
import { AngularSplitModule } from "angular-split";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { bootstrapApplication, BrowserModule } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { InlineHelpWrapperComponent } from "./app/formly/wrapper/inline-help-wrapper/inline-help-wrapper.component";
import { AddonsWrapperComponent } from "./app/formly/wrapper/addons/addons-wrapper.component";
import { OneColumnWrapperComponent } from "./app/formly/wrapper/one-column-wrapper.component";
import { FullWidthWrapperComponent } from "./app/formly/wrapper/full-width-wrapper.component";
import { SectionWrapper } from "./app/formly/wrapper/section-wrapper.component";
import { ButtonWrapperComponent } from "./app/formly/wrapper/button/button-wrapper.component";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatListModule } from "@angular/material/list";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { FormsModule } from "@angular/forms";
import { MatTabsModule } from "@angular/material/tabs";
import { MatMenuModule } from "@angular/material/menu";
import { TranslocoRootModule } from "./app/transloco-root.module";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { AppComponent } from "./app/app.component";
import Flow from "@flowjs/flow.js";
import { IgePagingIntl } from "./app/shared/IgePagingIntl";
import { AutocompleteTypeComponent } from "./app/formly/types/autocomplete-type.component";
import { LeafletTypeComponent } from "./app/formly/types/map/leaflet-type.component";
import { TableTypeComponent } from "./app/formly/types/table/table-type.component";
import { AddressTypeComponent } from "./app/formly/types/address-type/address-type.component";
import { RepeatComponent } from "./app/formly/types/repeat/repeat.component";
import { RepeatListComponent } from "./app/formly/types/repeat-list/repeat-list.component";
import { RepeatDetailListComponent } from "./app/formly/types/repeat-detail-list/repeat-detail-list.component";
import { RepeatDistributionDetailListComponent } from "./app/formly/types/repeat-distribution-detail-list/repeat-distribution-detail-list.component";
import { RepeatChipComponent } from "./app/formly/types/repeat-chip/repeat-chip.component";
import { DateRangeTypeComponent } from "./app/formly/types/date-range-type/date-range-type.component";
import { UploadTypeComponent } from "./app/formly/types/upload-type/upload-type.component";
import { SelectTypeComponent } from "./app/formly/types/select-type/select-type.component";
import { UnitInputComponent } from "./app/formly/types/unit-type/unit-input.component";
import { UvpSectionsComponent } from "./app/formly/types/uvp-sections/uvp-sections.component";
import { ReferencedDocumentsTypeComponent } from "./app/formly/types/referenced-documents-type/referenced-documents-type.component";
import { DocumentReferenceTypeComponent } from "./app/formly/types/document-reference-type/document-reference-type.component";
import { UpdateGetCapabilitiesComponent } from "./app/formly/types/update-get-capabilities/update-get-capabilities.component";
import { PreviewImageComponent } from "./app/formly/types/preview-image/preview-image.component";
import { PrintTypeComponent } from "./app/formly/types/print/print-type.component";
import {
  ElasticsearchAliasValidator,
  EmailValidator,
  IpValidator,
  LowercaseValidator,
  NoSpaceValidator,
  NotEmptyArrayValidator,
  PositiveNumValidator,
  UrlValidator,
} from "./app/formly/input.validators";
import { FormlyMatToggleModule } from "@ngx-formly/material/toggle";
import { FormlyMatDatepickerModule } from "@ngx-formly/material/datepicker";

if (environment.production) {
  enableProdMode();
  enableAkitaProdMode();
}

persistState({
  include: ["session"],
  preStorageUpdate: (storeName: string, state: any) => {
    const { currentTab, toggleFieldsButtonShowAll, ...otherUiState } = state.ui;
    return {
      ui: otherUiState,
      recentAddresses: state.recentAddresses,
    };
  },
  preStoreUpdate(storeName: string, state: any, initialState: any): any {
    // add initial values for fields that are not persisted
    if (!state.ui) state.ui = { ...initialState.ui };
    state.ui.currentTab = initialState.ui.currentTab;
    return state;
  },
});

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      environment.production
        ? []
        : AkitaNgDevtools.forRoot({ logTrace: false }),
      KeycloakAngularModule,
      AngularSplitModule,
      DragDropModule,
      MatTooltipModule,
      MatDialogModule,
      MatSnackBarModule,
      // ReactiveFormsModule,
      // angular
      BrowserModule,
      NgxFlowModule,
      FormlyModule.forRoot({
        types: [
          {
            name: "autocomplete",
            component: AutocompleteTypeComponent,
          },
          {
            name: "leaflet",
            component: LeafletTypeComponent,
          },
          {
            name: "table",
            component: TableTypeComponent,
          },
          {
            name: "address-card",
            component: AddressTypeComponent,
          },
          {
            name: "repeat",
            component: RepeatComponent,
          },
          {
            name: "repeatList",
            component: RepeatListComponent,
          },
          {
            name: "repeatDetailList",
            component: RepeatDetailListComponent,
          },
          {
            name: "repeatDistributionDetailList",
            component: RepeatDistributionDetailListComponent,
          },
          {
            name: "repeatChip",
            component: RepeatChipComponent,
          },
          {
            name: "date-range",
            component: DateRangeTypeComponent,
          },
          {
            name: "upload",
            component: UploadTypeComponent,
          },
          {
            name: "ige-select",
            component: SelectTypeComponent,
          },
          {
            name: "unit-input",
            component: UnitInputComponent,
          },
          {
            name: "uvpPhases",
            component: UvpSectionsComponent,
          },
          {
            name: "referencedDocuments",
            component: ReferencedDocumentsTypeComponent,
          },
          {
            name: "couplingService",
            component: DocumentReferenceTypeComponent,
          },
          {
            name: "updateGetCapabilities",
            component: UpdateGetCapabilitiesComponent,
          },
          {
            name: "previewImage",
            component: PreviewImageComponent,
          },
          /* FOR PREVIEW */
          {
            name: "inputPrint",
            component: PrintTypeComponent,
          },
          {
            name: "textareaPrint",
            component: PrintTypeComponent,
          },
          {
            name: "address-cardPrint",
            component: PrintTypeComponent,
          },
          {
            name: "datepickerPrint",
            component: PrintTypeComponent,
          },
          {
            name: "repeatListPrint",
            component: PrintTypeComponent,
          },
          {
            name: "tablePrint",
            component: PrintTypeComponent,
          },
          {
            name: "ige-selectPrint",
            component: PrintTypeComponent,
          },
          {
            name: "autocompletePrint",
            component: PrintTypeComponent,
          },
          {
            name: "previewImagePrint",
            component: PrintTypeComponent,
          },
          {
            name: "unit-inputPrint",
            component: PrintTypeComponent,
          },
        ],
        validators: [
          { name: "ip", validation: IpValidator },
          { name: "lowercase", validation: LowercaseValidator },
          { name: "no_space", validation: NoSpaceValidator },
          { name: "valid_es_alias", validation: ElasticsearchAliasValidator },
          { name: "email", validation: EmailValidator },
          { name: "notEmptyArray", validation: NotEmptyArrayValidator },
          { name: "url", validation: UrlValidator },
          { name: "positiveNum", validation: PositiveNumValidator },
        ],
        /*,
            wrappers: [
              { name: 'panel', component: OneColumnWrapperComponent },
            ]*/
        wrappers: [
          { name: "inline-help", component: InlineHelpWrapperComponent },
          { name: "addons", component: AddonsWrapperComponent },
          { name: "panel", component: OneColumnWrapperComponent },
          { name: "full-panel", component: FullWidthWrapperComponent },
          { name: "section", component: SectionWrapper },
          { name: "button", component: ButtonWrapperComponent },
          // { name: "animation", component: AnimationWrapperComponent },
        ],
        validationMessages: [
          { name: "maxLength", message: "Max length is required" },
        ],
        // TODO: this animation is too slow especially when there are a lot of tables in form
        //       we need another approach instead of wrapping every field with an animation
        // extensions: [
        //   { name: "animation", extension: { onPopulate: animationExtension } },
        // ],
        extras: {
          lazyRender: true,
        },
      }),
      FormlyMaterialModule,
      FormlyMatToggleModule,
      FormlyMatDatepickerModule,
      // Material
      MatToolbarModule,
      MatIconModule,
      MatButtonModule,
      MatDialogModule,
      MatSidenavModule,
      MatRadioModule,
      MatCheckboxModule,
      MatListModule,
      MatFormFieldModule,
      MatInputModule,
      MatCardModule,
      MatAutocompleteModule,
      MatTableModule,
      MatSortModule,
      MatProgressSpinnerModule,
      MatPaginatorModule,
      // IGE-Modules
      routing,
      FormsModule,
      MatTabsModule,
      MatMenuModule,
      TranslocoRootModule,
      ClipboardModule,
      MatNativeDateModule,
    ),
    provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration({})),
    // make sure we are authenticated by keycloak before bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [
        ConfigService,
        AuthenticationFactory,
        Router,
        HttpClient,
        MatDialog,
        TranslocoService,
      ],
      multi: true,
    },
    // set locale for dates
    {
      provide: LOCALE_ID,
      useValue: "de-de",
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: "de-DE",
    },
    {
      provide: DateAdapter,
      useClass: GermanDateAdapter,
    },
    // add authorization header to all requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // handle session timeouts
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionTimeoutInterceptor,
      multi: true,
    },
    // overwrite global error handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    // cache routes
    {
      provide: RouteReuseStrategy,
      useClass: CustomReuseStrategy,
      deps: [ConfigService],
    },
    // uploader
    {
      provide: FlowInjectionToken,
      useValue: Flow,
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        panelClass: "mat-dialog-override",
        hasBackdrop: true,
        maxWidth: "min(950px, 90vw)",
        role: "dialog",
        autoFocus: "dialog",
        restoreFocus: true,
      },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2000 },
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        showDelay: 1000,
        disableTooltipInteractivity: true,
      },
    },
    // WebSocket
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [ConfigService],
    },
    // Formly
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerTranslateExtension,
      deps: [TranslocoService],
    },
    // Pagination
    {
      provide: MatPaginatorIntl,
      useValue: new IgePagingIntl(),
    },
    // PLUGINS
    pluginProvider,
    provideAnimations(),
  ],
});
