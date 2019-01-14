import {AppComponent} from './app.component';
import {HashLocationStrategy, LocationStrategy, registerLocaleData} from '@angular/common';
import {appRoutingProviders, routing} from './app.router';
import {IgeFormModule} from './+form/ige-form.module';
import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {MenuComponent} from './menu/menu.component';
import {ModalService} from './services/modal/modal.service';
import {HelpComponent} from './help/help.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {environment} from '../environments/environment';
import {ConfigService} from './services/config/config.service';
import {LoginComponent} from './security/login.component';
import {GlobalErrorHandler} from './error-handler';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {FormFieldsModule} from './form-fields/form-fields.module';
import {
  MAT_DATE_LOCALE,
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatToolbarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ErrorDialogComponent} from './dialogs/error/error-dialog.component';
import {NewDocumentComponent} from './dialogs/new-document/new-document.component';
import {NewCatalogDialogComponent} from './dialogs/new-catalog/new-catalog-dialog.component';
import {UploadProfileDialogComponent} from './dialogs/upload-profile/upload-profile-dialog.component';
import {IgeError} from './models/ige-error';
import {DiscardConfirmDialogComponent} from "./dialogs/discard-confirm/discard-confirm-dialog.component";
import {FormsModule} from '@angular/forms';
import {de_DE, NgZorroAntdModule, NZ_I18N} from 'ng-zorro-antd';
import de from '@angular/common/locales/de';
import {DocumentDataService} from "./services/document/document-data.service";
import {DocumentMockService} from "./services/document/document-mock.service";
import {ConfigDataService} from "./services/config/config-data.service";
import {ConfigMockService} from "./services/config/config-mock.service";
import {CodelistDataService} from "./services/codelist/codelist-data.service";
import {CodelistMockService} from "./services/codelist/codelist-mock.service";
import {RoleDataService} from "./services/role/role-data.service";
import {RoleMockService} from "./services/role/role-mock.service";
import {BehaviorDataService} from "./services/behavior/behavior-data.service";
import {BehaviorMockService} from "./services/behavior/behavior-mock.service";
import {CatalogDataService} from "./+catalog/services/catalog-data.service";
import {CatalogMockService} from "./+catalog/services/catalog-mock.service";
import {UserDataService} from "./services/user/user-data.service";
import {UserMockService} from "./services/user/user-mock.service";
import {AkitaNgDevtools} from "@datorama/akita-ngdevtools";
import {AngularSplitModule} from "angular-split";

registerLocaleData(de);

export function ConfigLoader(configService: ConfigService, modal: ModalService) {
  return () => {

    return configService.load( environment.configFile )
      .then( () => configService.getCurrentUserInfo() )
      .then( userInfo => {
        const isAdmin = userInfo.roles && userInfo.roles.includes( 'admin');

        // an admin role has no constraints
        if (!isAdmin) {

          // check if user has any assigned catalog
          if (!userInfo.assignedCatalogs || userInfo.assignedCatalogs.length === 0) {
            const error = new IgeError();
            error.setMessage( 'The user has no assigned catalog. An administrator has to assign a catalog to this user.' );
            throw error;
          }
        }
      })
      .catch( err => {
        // remove loading spinner and rethrow error
        document.getElementsByClassName( 'app-loading' ).item( 0 ).remove();
        throw new IgeError(err);
      } );
  }
}

@NgModule( {
  // directives, components, and pipes owned by this NgModule
  declarations: [AppComponent, HelpComponent, MenuComponent, LoginComponent,
    ErrorDialogComponent, NewDocumentComponent, NewCatalogDialogComponent, DiscardConfirmDialogComponent, UploadProfileDialogComponent
  ],
  imports: [
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AngularSplitModule.forRoot(),
    // angular
    BrowserModule, BrowserAnimationsModule, HttpClientModule, HttpClientXsrfModule,
    // Flex layout
    FlexLayoutModule,
    // Material
    MatToolbarModule, MatIconModule, MatButtonModule, MatDialogModule, MatExpansionModule, MatRadioModule, MatCheckboxModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    // IGE-Modules
    IgeFormModule, FormFieldsModule,
    routing, FormsModule, NgZorroAntdModule
  ],
  exports: [
    MatRadioModule
  ],
  providers: [
    appRoutingProviders,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    // make sure we are authenticated by keycloak before bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [ConfigService, ModalService],
      multi: true
    },
    // date locale
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'de'
    },
    // add authorization header to all requests
      /*{
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
      },*/
    // overwrite global error handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: DocumentDataService,
      useClass: environment.production ? DocumentDataService : DocumentMockService
    },
    {
      provide: ConfigDataService,
      useClass: environment.production ? ConfigDataService : ConfigMockService
    },
    {
      provide: CodelistDataService,
      useClass: environment.production ? CodelistDataService : CodelistMockService
    },
    {
      provide: RoleDataService,
      useClass: environment.production ? RoleDataService : RoleMockService
    },
    {
      provide: BehaviorDataService,
      useClass: environment.production ? BehaviorDataService : BehaviorMockService
    },
    {
      provide: CatalogDataService,
      useClass: environment.production ? CatalogDataService : CatalogMockService
    },
    {
      provide: UserDataService,
      useClass: environment.production ? UserDataService : UserMockService
    },
    { provide: NZ_I18N, useValue: de_DE }

  ], // additional providers

  bootstrap: [AppComponent],
  entryComponents: [ErrorDialogComponent, NewDocumentComponent, NewCatalogDialogComponent, UploadProfileDialogComponent]
} )

export class AppModule {
}
