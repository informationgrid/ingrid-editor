import { AppComponent } from './app.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { StorageDummyService } from './services/storage/storage.dummy.service';
import { StorageService } from './services/storage/storage.service';
import { FormToolbarService } from './+form/toolbar/form-toolbar.service';
import { appRoutingProviders, routing } from './app.router';
import { PluginsModule } from './+behaviours/behaviours.module';
import { FieldsModule } from './+fields/fields.module';
import { DashboardModule } from './+dashboard/dashboard.module';
import { IgeFormModule } from './+form/ige-form.module';
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { BehavioursDefault } from './+behaviours/behaviours';
import { FormularService } from './services/formular/formular.service';
import { ModalService } from './services/modal/modal.service';
import { UserModule } from './+user/user.module';
import { AuthGuard } from './security/auth.guard';
import { FormChangeDeactivateGuard } from './security/form-change.guard';
import { ErrorService } from './services/error.service';
import { HelpComponent } from './help/help.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImportExportModule } from './+importExport/import-export.module';
import { ApiService } from './services/ApiService';
import { KeycloakService } from './keycloak/keycloak.service';
import { environment } from '../environments/environment';
import { ConfigService } from './config/config.service';
import { KeycloakMockService } from './keycloak/keycloak-mock.service';
import { PROFILES } from './services/formular/profile';
import { IsoServiceProfile } from './services/formular/iso/iso-service.profile';
import { UVPProfile } from './services/formular/uvp/uvp.profile';
import { AddressProfile } from './services/formular/address/address.profile';
import { FolderProfile } from './services/formular/folder/folder.profile';
import { ModalModule, PopoverModule } from 'ngx-bootstrap';
import { IsoDataPoolingProfile } from './services/formular/iso/iso-data-pooling.profile';
import { IsoDatasetProfile } from './services/formular/iso/iso-dataset.profile';
import { IsoInformationSystemProfile } from './services/formular/iso/iso-information-system.profile';
import { IsoLiteratureProfile } from './services/formular/iso/iso-literature.profile';
import { IsoProjectProfile } from './services/formular/iso/iso-project.profile';
import { IsoTaskProfile } from './services/formular/iso/iso-task.profile';
import { CatalogModule } from './+catalog/catalog.module';
import { LoginComponent } from './security/login.component';
import { GlobalErrorHandler } from './error-handler';
import { ChartModule, GrowlModule, TreeModule } from 'primeng/primeng';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpClientXsrfModule,
} from '@angular/common/http';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { AuthInterceptor } from './keycloak/auth.interceptor';

export function KeycloakLoader(configService: ConfigService) {
  const keycloakService = environment.mockKeycloak ? KeycloakMockService : KeycloakService;

  return () => {
    return configService.load(environment.configFile).then(() => {
      return keycloakService.init(configService.getConfiguration());
    }).catch(err => {
      console.error('Keycloak could not be initialized', err);
      debugger;
      if (!environment.mockKeycloak) {
        window.location.reload();
      }
    });
  }
}

@NgModule({
  // directives, components, and pipes owned by this NgModule
  declarations: [AppComponent, HelpComponent, MenuComponent, LoginComponent],
  imports: [
    // angular
    BrowserModule, BrowserAnimationsModule, HttpClientModule, HttpClientXsrfModule,
    // ngx-bootstrap
    PopoverModule.forRoot(),
    // PrimeNG
    TreeModule, GrowlModule,
    // IGE-Modules
    IgeFormModule, DashboardModule, FieldsModule, CatalogModule, FormFieldsModule,
    UserModule, ImportExportModule, PluginsModule, routing, ModalModule.forRoot()],
  providers: [
    appRoutingProviders, AuthGuard, FormChangeDeactivateGuard,
    KeycloakService,
    ErrorService, ConfigService, FormToolbarService, FormularService, StorageService,
    StorageDummyService, BehavioursDefault, ModalService, ApiService, FormularService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    // make sure we are authenticated by keycloak before bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: KeycloakLoader,
      deps: [ConfigService],
      multi: true
    },
    // add authorization header to all requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // overwrite global error handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    // definition of profiles to be loaded
    {provide: PROFILES, useClass: UVPProfile, multi: true},
    {provide: PROFILES, useClass: AddressProfile, multi: true},
    {provide: PROFILES, useClass: FolderProfile, multi: true},
    {provide: PROFILES, useClass: IsoDataPoolingProfile, multi: true},
    {provide: PROFILES, useClass: IsoDatasetProfile, multi: true},
    {provide: PROFILES, useClass: IsoInformationSystemProfile, multi: true},
    {provide: PROFILES, useClass: IsoLiteratureProfile, multi: true},
    {provide: PROFILES, useClass: IsoProjectProfile, multi: true},
    {provide: PROFILES, useClass: IsoServiceProfile, multi: true},
    {provide: PROFILES, useClass: IsoTaskProfile, multi: true}
  ], // additional providers

  bootstrap: [AppComponent]
})

export class AppModule {
}
