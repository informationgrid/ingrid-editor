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
  provideHttpClient,
  withInterceptorsFromDi,
  withXsrfConfiguration,
} from "@angular/common/http";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialog,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ErrorDialogComponent } from "./dialogs/error/error-dialog.component";
import { IgeError } from "./models/ige-error";
import { FormsModule } from "@angular/forms";
import de from "@angular/common/locales/de";
import { AkitaNgDevtools } from "@datorama/akita-ngdevtools";
import { AngularSplitModule } from "angular-split";
import { FORMLY_CONFIG, FormlyModule } from "@ngx-formly/core";
import { OneColumnWrapperComponent } from "./formly/wrapper/one-column-wrapper.component";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { SideMenuComponent } from "./side-menu/side-menu.component";
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipModule,
} from "@angular/material/tooltip";
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { SectionWrapper } from "./formly/wrapper/section-wrapper.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "./dialogs/confirm/confirm-dialog.component";
import { MainHeaderComponent } from "./main-header/main-header.component";
import { MatTabsModule } from "@angular/material/tabs";
import { MatMenuModule } from "@angular/material/menu";
import { AuthInterceptor } from "./security/keycloak/auth.interceptor";
import { SharedDocumentItemModule } from "./shared/shared-document-item.module";
import { InlineHelpWrapperComponent } from "./formly/wrapper/inline-help-wrapper/inline-help-wrapper.component";
import { FullWidthWrapperComponent } from "./formly/wrapper/full-width-wrapper.component";
import { SessionTimeoutInterceptor } from "./services/session-timeout.interceptor";
import { SessionTimeoutInfoComponent } from "./main-header/session-timeout-info/session-timeout-info.component";
import { FormFieldsModule } from "./form-fields/form-fields.module";
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from "@angular/material/snack-bar";
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
import { AddonsWrapperComponent } from "./formly/wrapper/addons/addons-wrapper.component";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatPaginatorModule } from "@angular/material/paginator";
import { ButtonWrapperComponent } from "./formly/wrapper/button/button-wrapper.component";
import { pluginProvider } from "./plugin.provider";
import { DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";
import { GermanDateAdapter } from "./services/german-date.adapter";
import { firstValueFrom } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";
import { registerTranslateExtension } from "./formly/translate.extension";
import { FieldToAriaLabelPipe } from "./directives/fieldToAiraLabel.pipe";

registerLocaleData(de);

export function ConfigLoader(
  configService: ConfigService,
  authFactory: AuthenticationFactory,
  router: Router,
  http: HttpClient,
  dialog: MatDialog,
  translocoService: TranslocoService,
) {
  function getRedirectNavigationCommand(catalogId: string, urlPath: string) {
    const splittedUrl = urlPath.split(";");
    const commands: any[] = [`/${catalogId}/${splittedUrl[0]}`];
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
    dialog: MatDialog,
  ) {
    const userInfo = configService.$userInfo.value;
    const catalogId = userInfo.currentCatalog.id;
    const contextPath = configService.getConfiguration().contextPath;
    const urlPath = document.location.pathname.substring(contextPath.length); // remove context path
    // get first part of the path without any parameters separated by ";"
    const rootPath = urlPath
      .split("/")[0] // split paths
      .split(";")[0]; // split parameters
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
        (assigned) => assigned.id === rootPath,
      );
      if (isAssignedToCatalog) {
        await firstValueFrom(
          http.post<Catalog>(
            configService.getConfiguration().backendUrl +
              "user/catalog/" +
              rootPath,
            null,
          ),
        ).then(() => configService.getCurrentUserInfo());
        return;
      }

      dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: "Hinweis",
            message: `Der Katalog "${rootPath}" ist dem eingeloggten Benutzer nicht zugeordnet`,
            buttons: [{ text: "Schließen", alignRight: true, emphasize: true }],
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
      .then(() => firstValueFrom(translocoService.load("de")))
      .then(() => console.debug("FINISHED APP INIT"))
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

@NgModule({
    // directives, components, and pipes owned by this NgModule
    declarations: [AppComponent], // additional providers
    bootstrap: [AppComponent],
    exports: [SectionWrapper],
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
        FormlyModule.forRoot({
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
        SharedDocumentItemModule,
        FormFieldsModule,
        TranslocoRootModule,
        SharedModule,
        ClipboardModule,
        SessionTimeoutInfoComponent,
        FieldToAriaLabelPipe,
        SectionWrapper,
        ErrorDialogComponent,
        HelpComponent,
        ConfirmDialogComponent,
        ReplaceAddressDialogComponent,
        OneColumnWrapperComponent,
        FullWidthWrapperComponent,
        InlineHelpWrapperComponent,
        SideMenuComponent,
        MainHeaderComponent,
        InitCatalogComponent,
        AddonsWrapperComponent,
        ButtonWrapperComponent,
    ],
    providers: [
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
        // PLUGINS
        pluginProvider,
        /*    {
          provide: XSRF_TOKEN,
          useFactory: () => generateXsrfToken()
        },*/
    ],
})
export class AppModule {}
