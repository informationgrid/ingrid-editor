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
  HttpClientModule,
  HttpClientXsrfModule,
} from "@angular/common/http";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ErrorDialogComponent } from "./dialogs/error/error-dialog.component";
import { IgeError } from "./models/ige-error";
import { FormsModule } from "@angular/forms";
import de from "@angular/common/locales/de";
import { AkitaNgDevtools } from "@datorama/akita-ngdevtools";
import { AngularSplitModule } from "angular-split";
import { FormlyModule } from "@ngx-formly/core";
import { OneColumnWrapperComponent } from "./formly/wrapper/one-column-wrapper.component";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { SideMenuComponent } from "./side-menu/side-menu.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { SectionWrapper } from "./formly/wrapper/section-wrapper.component";
import { ConfirmDialogComponent } from "./dialogs/confirm/confirm-dialog.component";
import { MainHeaderComponent } from "./main-header/main-header.component";
import { MatTabsModule } from "@angular/material/tabs";
import { MatMenuModule } from "@angular/material/menu";
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
  AnimationWrapper,
  AnimationWrapperComponent,
} from "./animation-wrapper.component";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";
import {
  InjectableRxStompConfig,
  RxStompService,
  rxStompServiceFactory,
} from "@stomp/ng2-stompjs";
import { IgeStompConfig } from "./ige-stomp.config";
import { KeycloakAngularModule } from "keycloak-angular";
import { initializeKeycloakAndGetUserInfo } from "./keycloak.init";
import { AuthenticationFactory } from "./security/auth.factory";
import { RouteReuseStrategy } from "@angular/router";
import { NgxFlowModule, FlowInjectionToken } from "@flowjs/ngx-flow";
import Flow from "@flowjs/flow.js";

registerLocaleData(de);

export function ConfigLoader(
  configService: ConfigService,
  authFactory: AuthenticationFactory
) {
  return () => {
    return configService
      .load()
      .then(() => initializeKeycloakAndGetUserInfo(authFactory, configService))
      .then(() => console.log("FINISHED APP INIT"))
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
  declarations: [
    AppComponent,
    HelpComponent,
    ErrorDialogComponent,
    ConfirmDialogComponent,
    OneColumnWrapperComponent,
    FullWidthWrapperComponent,
    SectionWrapper,
    InlineHelpWrapperComponent,
    SideMenuComponent,
    TimePipe,
    MainHeaderComponent,
    SessionTimeoutInfoComponent,
    AnimationWrapperComponent,
  ],
  imports: [
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    KeycloakAngularModule,
    AngularSplitModule,
    MatTooltipModule,
    MatDialogModule,
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
      wrappers: [
        { name: "inline-help", component: InlineHelpWrapperComponent },
        { name: "panel", component: OneColumnWrapperComponent },
        { name: "full-panel", component: FullWidthWrapperComponent },
        { name: "section", component: SectionWrapper },
        { name: "animation", component: AnimationWrapperComponent },
      ],
      manipulators: [{ class: AnimationWrapper, method: "run" }],
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
  ],
  providers: [
    // make sure we are authenticated by keycloak before bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [ConfigService, AuthenticationFactory],
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
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { panelClass: "mat-dialog-override" },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2000 },
    },

    // WebSocket
    {
      provide: InjectableRxStompConfig,
      useClass: IgeStompConfig,
      deps: [ConfigService],
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [InjectableRxStompConfig],
    },

    // PLUGINS
    pluginProvider,
  ], // additional providers

  bootstrap: [AppComponent],
})
export class AppModule {}
