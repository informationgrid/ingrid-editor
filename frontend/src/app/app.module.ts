import { AppComponent } from "./app.component";
import { registerLocaleData } from "@angular/common";
import { CustomReuseStrategy, routing } from "./app.router";
import { BrowserModule } from "@angular/platform-browser";
import {
  APP_INITIALIZER,
  ErrorHandler,
  LOCALE_ID,
  NgModule,
} from "@angular/core";
import { HelpComponent } from "./help/help.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { environment } from "../environments/environment";
import { ConfigService } from "./services/config/config.service";
import { GlobalErrorHandler } from "./error-handler";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  HttpClientXsrfModule,
} from "@angular/common/http";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import {
  MAT_LEGACY_DIALOG_DEFAULT_OPTIONS as MAT_DIALOG_DEFAULT_OPTIONS,
  MatLegacyDialog as MatDialog,
  MatLegacyDialogModule as MatDialogModule,
} from "@angular/material/legacy-dialog";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ErrorDialogComponent } from "./dialogs/error/error-dialog.component";
import { IgeError } from "./models/ige-error";
import { FormsModule } from "@angular/forms";
import de from "@angular/common/locales/de";
import { AkitaNgDevtools } from "@datorama/akita-ngdevtools";
import { AngularSplitModule } from "angular-split";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { OneColumnWrapperComponent } from "./formly/wrapper/one-column-wrapper.component";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { SideMenuComponent } from "./side-menu/side-menu.component";
import {
  MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS as MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatLegacyTooltipModule as MatTooltipModule,
} from "@angular/material/legacy-tooltip";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { SectionWrapper } from "./formly/wrapper/section-wrapper.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "./dialogs/confirm/confirm-dialog.component";
import { MainHeaderComponent } from "./main-header/main-header.component";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { AuthInterceptor } from "./security/keycloak/auth.interceptor";
import { SharedDocumentItemModule } from "./shared/shared-document-item.module";
import { pluginProvider } from "./plugin.provider";
import { InlineHelpWrapperComponent } from "./formly/wrapper/inline-help-wrapper/inline-help-wrapper.component";
import { FullWidthWrapperComponent } from "./formly/wrapper/full-width-wrapper.component";
import { SessionTimeoutInterceptor } from "./services/session-timeout.interceptor";
import { SessionTimeoutInfoComponent } from "./main-header/session-timeout-info/session-timeout-info.component";
import { TimePipe } from "./directives/time.pipe";
import { FormFieldsModule } from "./form-fields/form-fields.module";
import {
  MAT_LEGACY_SNACK_BAR_DEFAULT_OPTIONS as MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatLegacySnackBarModule as MatSnackBarModule,
} from "@angular/material/legacy-snack-bar";
import { KeycloakAngularModule } from "keycloak-angular";
import { initializeKeycloakAndGetUserInfo } from "./keycloak.init";
import { AuthenticationFactory } from "./security/auth.factory";
import { Router, RouteReuseStrategy } from "@angular/router";
import { FlowInjectionToken, NgxFlowModule } from "@flowjs/ngx-flow";
import Flow from "@flowjs/flow.js";
import { TranslocoRootModule } from "./transloco-root.module";
import { ReplaceAddressDialogComponent } from "./+catalog/+behaviours/system/DeleteReferenceHandler/replace-address-dialog/replace-address-dialog.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { SharedModule } from "./shared/shared.module";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { InitCatalogComponent } from "./init-catalog/init-catalog.component";
import { Catalog } from "./+catalog/services/catalog.model";
import { rxStompServiceFactory } from "./rx-stomp-service-factory";
import { RxStompService } from "./rx-stomp.service";

registerLocaleData(de);

export function ConfigLoader(
  configService: ConfigService,
  authFactory: AuthenticationFactory,
  router: Router,
  http: HttpClient,
  dialog: MatDialog
) {
  function getRedirectNavigationCommand(catalogId: string, urlPath: string) {
    const splittedUrl = urlPath.split(";");
    const commands: any[] = [`/${catalogId}${splittedUrl[0]}`];
    if (splittedUrl.length > 1) {
      const parameterData = splittedUrl[1].split("=");
      const parameter = {};
      parameter[parameterData[0]] = parameterData[1];
      commands.push(parameter);
    }
    return commands;
  }

  async function redirectToCatalogSpecificRoute(
    router: Router,
    dialog: MatDialog
  ) {
    const userInfo = configService.$userInfo.value;
    const catalogId = userInfo.currentCatalog.id;
    const urlPath = document.location.pathname;
    // FIXME: what about IGE-NG installed behind a context path? check configuration!
    // get first part of the path without any parameters separated by ";"
    const rootPath = urlPath.split("/")[1].split(";")[0];
    if (rootPath !== catalogId) {
      // check if no catalogId is in requested URL
      const hasNoCatalogId =
        rootPath === "index.html" ||
        router.config[0].children.some((route) => route.path === rootPath);
      if (hasNoCatalogId) {
        const commands = getRedirectNavigationCommand(catalogId, urlPath);
        // redirect a bit delayed to complete this navigation first before doing another
        setTimeout(() => router.navigate(commands));
        return;
      }

      const isAssignedToCatalog = userInfo.assignedCatalogs.some(
        (assigned) => assigned.id === rootPath
      );
      if (isAssignedToCatalog) {
        // await catalogService.switchCatalog(rootPath).toPromise();
        await http
          .post<Catalog>(
            configService.getConfiguration().backendUrl +
              "user/catalog/" +
              rootPath,
            null
          )
          .toPromise()
          .then(() => configService.getCurrentUserInfo());
        return;
      }

      dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: "Fehler",
            message: `Der Katalog "${rootPath}" ist dem eingeloggten Benutzer nicht zugeordnet`,
            confirmButtonText: "Zum aktuellen Katalog",
          } as ConfirmDialogData,
        })
        .afterClosed()
        .subscribe(() => {
          router.navigate([`${ConfigService.catalogId}/dashboard`]);
        });
    }
  }

  return () => {
    return configService
      .load()
      .then(() => initializeKeycloakAndGetUserInfo(authFactory, configService))
      .then(() => console.log("FINISHED APP INIT"))
      .then(() => redirectToCatalogSpecificRoute(router, dialog))
      .catch((err) => {
        // remove loading spinner and rethrow error
        document.getElementsByClassName("app-loading").item(0).innerHTML =
          "Fehler bei der Initialisierung";

        if (err.status === 504) {
          throw new IgeError("Backend ist wohl nicht gestartet");
        } else if (err instanceof IgeError) {
          throw err;
        }
        throw new IgeError(err);
      });
  };
}

export function animationExtension(field: FormlyFieldConfig) {
  if (field.wrappers && field.wrappers.includes("animation")) {
    return;
  }

  field.wrappers = ["animation", ...(field.wrappers || [])];
}

@NgModule({
  // directives, components, and pipes owned by this NgModule
  declarations: [
    AppComponent,
    HelpComponent,
    ErrorDialogComponent,
    ConfirmDialogComponent,
    ReplaceAddressDialogComponent,
    OneColumnWrapperComponent,
    FullWidthWrapperComponent,
    SectionWrapper,
    InlineHelpWrapperComponent,
    SideMenuComponent,
    TimePipe,
    MainHeaderComponent,
    SessionTimeoutInfoComponent,
    InitCatalogComponent,
  ],
  imports: [
    environment.production ? [] : AkitaNgDevtools.forRoot({ logTrace: false }),
    KeycloakAngularModule,
    AngularSplitModule,
    DragDropModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    // ReactiveFormsModule,
    // angular
    BrowserModule,
    BrowserAnimationsModule,
    NgxFlowModule,
    HttpClientModule,
    HttpClientXsrfModule,
    // Flex layout
    FlexLayoutModule,
    FormlyModule.forRoot({
      types: [
        {
          name: "just-a-name",
          extends: "formly-group",
          defaultOptions: {
            defaultValue: {},
          },
        },
      ],
      wrappers: [
        { name: "inline-help", component: InlineHelpWrapperComponent },
        { name: "panel", component: OneColumnWrapperComponent },
        { name: "full-panel", component: FullWidthWrapperComponent },
        { name: "section", component: SectionWrapper },
        // { name: "animation", component: AnimationWrapperComponent },
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
    // IGE-Modules
    routing,
    FormsModule,
    MatTabsModule,
    MatMenuModule,
    SharedDocumentItemModule,
    FormFieldsModule,
    TranslocoRootModule,
    SharedModule,
    ClipboardModule,
  ],
  providers: [
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
      ],
      multi: true,
    },
    // set locale for dates
    {
      provide: LOCALE_ID,
      useValue: "de-de",
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
      },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2000 },
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: { disableTooltipInteractivity: true },
    },

    // WebSocket
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [ConfigService],
    },

    // PLUGINS
    pluginProvider,
  ], // additional providers
  bootstrap: [AppComponent],
  exports: [SectionWrapper],
})
export class AppModule {}
