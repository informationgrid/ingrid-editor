import {AppComponent} from './app.component';
import {StatisticComponent} from './+behaviours/system/statistic/statistic.component';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {StorageDummyService} from './services/storage/storage.dummy.service';
import {StorageService} from './services/storage/storage.service';
import {FormToolbarService} from './+form/toolbar/form-toolbar.service';
import {appRoutingProviders, routing} from './router';
import {RadioControlRegistry} from '@angular/forms/src/directives/radio_control_value_accessor';
import {ROUTER_PROVIDERS} from '@angular/router/src/router_module';
import {PluginsModule} from './+behaviours/behaviours.module';
import {FieldsModule} from './+fields/fields.module';
import {DashboardModule} from './+dashboard/dashboard.module';
import {IgeFormModule} from './+form/ige-form.module';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MenuComponent} from './menu/menu.component';
import {BehavioursDefault} from './+behaviours/behaviours';
import {BehaviourService} from './+behaviours/behaviour.service';
import {FormularService} from './services/formular/formular.service';
import {ModalService} from './services/modal/modal.service';
import {ModalModule} from 'ng2-modal';
import {UserModule} from './+user/user.module';
import {LoginComponent} from './security/login.component';
import {AuthGuard} from './security/auth.guard';
import {AuthService} from './services/security/auth.service';
import {ConfigService} from './config/config.service';
import {FormChangeDeactivateGuard} from './security/form-change.guard';
import {ErrorService} from './services/error.service';
import {HelpComponent} from './help/help.component';
import {AUTH_PROVIDERS} from 'angular2-jwt';

@NgModule( {
  declarations: [AppComponent, HelpComponent, LoginComponent, StatisticComponent, MenuComponent], // directives, components, and pipes owned by this NgModule
  imports: [BrowserModule, HttpModule, IgeFormModule, DashboardModule, FieldsModule, UserModule, PluginsModule, routing, ModalModule],
  providers: [ROUTER_PROVIDERS, AUTH_PROVIDERS, RadioControlRegistry, appRoutingProviders, AuthGuard, FormChangeDeactivateGuard,
    ErrorService, AuthService, ConfigService, FormToolbarService, FormularService, StorageService,
    StorageDummyService, BehaviourService, BehavioursDefault, ModalService, {
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }], // additional providers
  entryComponents: [StatisticComponent],
  bootstrap: [AppComponent]
} )

export class IgeModule {}