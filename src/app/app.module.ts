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
import {Http, HttpModule, RequestOptions, XHRBackend} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {MenuComponent} from './menu/menu.component';
import {BehavioursDefault} from './+behaviours/behaviours';
import {FormularService} from './services/formular/formular.service';
import {ModalService} from './services/modal/modal.service';
import {UserModule} from './+user/user.module';
import {AuthGuard} from './security/auth.guard';
import {FormChangeDeactivateGuard} from './security/form-change.guard';
import {ErrorService} from './services/error.service';
import {HelpComponent} from './help/help.component';
import {ToastService} from './services/toast.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ImportExportModule} from './+importExport/import-export.module';
import {ApiService} from './services/ApiService';
import {KeycloakService} from './keycloak/keycloak.service';
import {KEYCLOAK_HTTP_PROVIDER} from './keycloak/keycloak.http';
import {Ng2SmartTableModule} from 'ng2-smart-table';
import {environment} from '../environments/environment';
import {ConfigService, HttpOrig} from './config/config.service';
import {KeycloakMockService} from './keycloak/keycloak-mock.service';
import {PROFILES} from './services/formular/profile';
import {IsoServiceProfile} from './services/formular/iso/iso-service.profile';
import {UVPProfile} from './services/formular/uvp/uvp.profile';
import {AddressProfile} from './services/formular/address/address.profile';
import {FolderProfile} from './services/formular/folder/folder.profile';
import { AccordionModule, BsDatepickerModule, ModalModule, PopoverModule } from 'ngx-bootstrap';
import {IsoDataPoolingProfile} from './services/formular/iso/iso-data-pooling.profile';
import {IsoDatasetProfile} from './services/formular/iso/iso-dataset.profile';
import {IsoInformationSystemProfile} from './services/formular/iso/iso-information-system.profile';
import {IsoLiteratureProfile} from './services/formular/iso/iso-literature.profile';
import {IsoProjectProfile} from './services/formular/iso/iso-project.profile';
import {IsoTaskProfile} from './services/formular/iso/iso-task.profile';
import { CatalogModule } from './+catalog/catalog.module';

export function HttpLoader(backend: XHRBackend, defaultOptions: RequestOptions) {
  return new Http(backend, defaultOptions);
}

export function KeycloakLoader(configService: ConfigService) {
  const keycloakService = environment.mockKeycloak ? KeycloakMockService : KeycloakService;

  return () => {
    return configService.load(environment.configFile).then( () => {
      return keycloakService.init(configService.getConfiguration());
    } ).catch( err => {
      console.error( 'Keycloak could not be initialized', err);
      debugger;
      if (!environment.mockKeycloak) {
        window.location.reload();
      }
    });
  }
}

@NgModule( {
  // directives, components, and pipes owned by this NgModule
  declarations: [AppComponent, HelpComponent, MenuComponent],
  imports: [BrowserModule, BrowserAnimationsModule, HttpModule,
    Ng2SmartTableModule,
    PopoverModule.forRoot(), BsDatepickerModule.forRoot(), AccordionModule.forRoot(),
    IgeFormModule, DashboardModule, FieldsModule, CatalogModule,
    UserModule, ImportExportModule, PluginsModule, routing, ModalModule.forRoot()],
  providers: [
    appRoutingProviders, AuthGuard, FormChangeDeactivateGuard,
    KeycloakService, KEYCLOAK_HTTP_PROVIDER,
    ErrorService, ConfigService, FormToolbarService, FormularService, StorageService,
    StorageDummyService, BehavioursDefault, ModalService, ApiService, ToastService, {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: HttpOrig, // used for initial config load
      useFactory: HttpLoader,
      deps: [XHRBackend, RequestOptions]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: KeycloakLoader,
      deps: [ConfigService],
      multi: true
    },

    {provide: PROFILES, useClass: UVPProfile, multi: true},
    {provide: PROFILES, useClass: AddressProfile, multi: true},
    {provide: PROFILES, useClass: FolderProfile, multi: true},
    {provide: PROFILES, useClass: IsoDataPoolingProfile, multi: true},
    {provide: PROFILES, useClass: IsoDatasetProfile, multi: true},
    {provide: PROFILES, useClass: IsoInformationSystemProfile, multi: true},
    {provide: PROFILES, useClass: IsoLiteratureProfile, multi: true},
    {provide: PROFILES, useClass: IsoProjectProfile, multi: true},
    {provide: PROFILES, useClass: IsoServiceProfile, multi: true},
    {provide: PROFILES, useClass: IsoTaskProfile, multi: true},

    FormularService
  ], // additional providers

  bootstrap: [AppComponent]
} )

export class AppModule {
}
