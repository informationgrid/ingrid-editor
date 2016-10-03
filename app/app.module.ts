import {AppComponent} from './app.component';
import {StatisticComponent} from './plugins/statistic/statistic.component';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {StorageDummyService} from './services/storage/storage.dummy.service';
import {StorageService} from './services/storage/storage.service';
import {FormToolbarService} from './+form/toolbar/form-toolbar.service';
import {appRoutingProviders, routing} from './router';
import {RadioControlRegistry} from '@angular/forms/src/directives/radio_control_value_accessor';
import {ROUTER_PROVIDERS} from '@angular/router/src/router_module';
import {TranslateModule} from 'ng2-translate';
import {PluginsModule} from './plugins/plugins.module';
import {FieldsModule} from './+fields/fields.module';
import {DashboardModule} from './+dashboard/dashboard.module';
import {IgeFormModule} from './+form/ige-form.module';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MenuComponent} from './menu/menu.component';
import {BehavioursDefault} from "./services/behaviour/behaviours";
import {BehaviourService} from "./services/behaviour/behaviour.service";
import {FormularService} from "./services/formular/formular.service";

@NgModule( {
  declarations: [AppComponent, StatisticComponent, MenuComponent], // directives, components, and pipes owned by this NgModule
  imports: [BrowserModule, HttpModule, IgeFormModule, DashboardModule, FieldsModule, PluginsModule, routing, TranslateModule.forRoot()],
  providers: [ROUTER_PROVIDERS, RadioControlRegistry, appRoutingProviders, FormToolbarService, FormularService, StorageService, StorageDummyService, BehaviourService, BehavioursDefault, {
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }], // additional providers
  entryComponents: [StatisticComponent],
  bootstrap: [AppComponent]
} )

export class IgeModule {}