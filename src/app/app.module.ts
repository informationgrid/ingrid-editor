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
import {ModalModule} from 'ngx-modal';
import {UserModule} from './+user/user.module';
import {AuthGuard} from './security/auth.guard';
import {ConfigService} from './config/config.service';
import {FormChangeDeactivateGuard} from './security/form-change.guard';
import {ErrorService} from './services/error.service';
import {HelpComponent} from './help/help.component';
import {ToastService} from './services/toast.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ImportExportModule} from './+importExport/import-export.module';
import {ApiService} from './services/ApiService';
import {KeycloakService} from './keycloak/keycloak.service';
import {KEYCLOAK_HTTP_PROVIDER} from './keycloak/keycloak.http';

@NgModule( {
  // directives, components, and pipes owned by this NgModule
  declarations: [AppComponent, HelpComponent, MenuComponent],
  imports: [BrowserModule, BrowserAnimationsModule, HttpModule,
    IgeFormModule, DashboardModule, FieldsModule,
    UserModule, ImportExportModule, PluginsModule, routing, ModalModule],
  providers: [appRoutingProviders, AuthGuard, FormChangeDeactivateGuard,
    KeycloakService, KEYCLOAK_HTTP_PROVIDER,
    ErrorService, ConfigService, FormToolbarService, FormularService, StorageService,
    StorageDummyService, BehavioursDefault, ModalService, ApiService, ToastService, {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }], // additional providers
  bootstrap: [AppComponent]
} )

export class AppModule {
}
