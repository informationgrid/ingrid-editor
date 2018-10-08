import {AppComponent} from './app.component';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {StorageDummyService} from './services/storage/storage.dummy.service';
import {StorageService} from './services/storage/storage.service';
import {FormToolbarService} from './+form/toolbar/form-toolbar.service';
import {appRoutingProviders, routing} from './app.router';
import {PluginsModule} from './+behaviours/behaviours.module';
import {FieldsModule} from './+fields/fields.module';
import {DashboardModule} from './+dashboard/dashboard.module';
import {IgeFormModule} from './+form/ige-form.module';
import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {MenuComponent} from './menu/menu.component';
import {BehavioursDefault} from './+behaviours/behaviours';
import {FormularService} from './services/formular/formular.service';
import {ModalService} from './services/modal/modal.service';
import {UserModule} from './+user/user.module';
import {AuthGuard} from './security/auth.guard';
import {FormChangeDeactivateGuard} from './security/form-change.guard';
import {ErrorService} from './services/error.service';
import {HelpComponent} from './help/help.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ImportExportModule} from './+importExport/import-export.module';
import {ApiService} from './services/ApiService';
import {KeycloakService} from './security/keycloak/keycloak.service';
import {environment} from '../environments/environment';
import {ConfigService} from './services/config.service';
import {CatalogModule} from './+catalog/catalog.module';
import {LoginComponent} from './security/login.component';
import {GlobalErrorHandler} from './error-handler';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {FormFieldsModule} from './form-fields/form-fields.module';
import {ProfileService} from './services/profile.service';
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
import {FileUploadModule} from 'primeng/fileupload';
import {IgeError} from './models/ige-error';
import {NoCatalogAssignedGuard} from "./security/no-catalog-assigned.guard";

export function ConfigLoader(configService: ConfigService, modal: ModalService) {
  return () => {

    return configService.load( environment.configFile )
      .then( () => configService.getCurrentUserInfo() )
      .then( userInfo => {
        const isAdmin = userInfo.roles && userInfo.roles.includes( 'admin');

        // an admin role has no constraints
        if (!isAdmin) {

          // check if user has any assigned catalog
          if (userInfo.assignedCatalogs.length === 0) {
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
    ErrorDialogComponent, NewDocumentComponent, NewCatalogDialogComponent, UploadProfileDialogComponent
  ],
  imports: [
    // angular
    BrowserModule, BrowserAnimationsModule, HttpClientModule, HttpClientXsrfModule,
    // PrimeNG
    FileUploadModule,
    // Flex layout
    FlexLayoutModule,
    // Material
    MatToolbarModule, MatIconModule, MatButtonModule, MatDialogModule, MatExpansionModule, MatRadioModule, MatCheckboxModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    // IGE-Modules
    IgeFormModule, DashboardModule, FieldsModule, CatalogModule, FormFieldsModule,
    UserModule, ImportExportModule, PluginsModule, routing],
  exports: [
    MatRadioModule
  ],
  providers: [
    appRoutingProviders, AuthGuard, NoCatalogAssignedGuard, FormChangeDeactivateGuard,
    KeycloakService,
    ErrorService, ConfigService, FormToolbarService, FormularService, StorageService,
    StorageDummyService, BehavioursDefault, ModalService, ApiService, FormularService, ProfileService,
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
    }
    // TODO: only for development!
    // mockKeycloakProvider

  ], // additional providers

  bootstrap: [AppComponent],
  entryComponents: [ErrorDialogComponent, NewDocumentComponent, NewCatalogDialogComponent, UploadProfileDialogComponent]
} )

export class AppModule {
}
