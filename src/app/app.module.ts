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
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
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
import {IsoProfile} from './services/formular/iso/iso.profile';
import {UVPProfile} from './services/formular/uvp/uvp.profile';
import {PROFILES} from './services/formular/profile';
import {AddressProfile} from './services/formular/address/address.profile';
import {FolderProfile} from './services/formular/folder/folder.profile';
import {FileUploadModule} from 'ng2-file-upload';
import {AccordionModule, BsDatepickerModule, ModalModule, PopoverModule} from 'ngx-bootstrap';

@NgModule( {
  // directives, components, and pipes owned by this NgModule
  declarations: [AppComponent, HelpComponent, MenuComponent],
  imports: [BrowserModule, BrowserAnimationsModule, HttpModule,
    Ng2SmartTableModule, FileUploadModule, PopoverModule.forRoot(), BsDatepickerModule.forRoot(), AccordionModule.forRoot(),
    IgeFormModule, DashboardModule, FieldsModule,
    UserModule, ImportExportModule, PluginsModule, routing, ModalModule.forRoot()],
  providers: [appRoutingProviders, AuthGuard, FormChangeDeactivateGuard,
    KeycloakService, KEYCLOAK_HTTP_PROVIDER,
    ErrorService, FormToolbarService, StorageService,
    StorageDummyService, BehavioursDefault, ModalService, ApiService, ToastService, {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {provide: PROFILES, useClass: IsoProfile, multi: true},
    {provide: PROFILES, useClass: UVPProfile, multi: true},
    {provide: PROFILES, useClass: AddressProfile, multi: true},
    {provide: PROFILES, useClass: FolderProfile, multi: true},
    FormularService
  ], // additional providers

  bootstrap: [AppComponent]
} )

export class AppModule {
}
