import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import '../node_modules/ag-grid/dist/styles/ag-grid.css';
import '../node_modules/ag-grid/dist/styles/theme-blue.css';
import '../node_modules/leaflet/dist/leaflet.css';
import '../styles.css';
import {AppComponent} from './app.component';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {appRoutingProviders, routing} from './router';
import {FormsModule} from '@angular/forms';
import {ROUTER_PROVIDERS} from '@angular/router/src/router_module';
import {RadioControlRegistry} from '@angular/forms/src/directives/radio_control_value_accessor';
import {DashboardComponent} from './+dashboard/dashboard.component';
import {DynamicFormComponent} from './form/dynamic-form.component';
import {PluginsModule} from './plugins/plugins.module';
import {StatisticComponent} from './plugins/statistic/statistic.component';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';

@NgModule( {
  declarations: [DashboardComponent, DynamicFormComponent, AppComponent, StatisticComponent], // directives, components, and pipes owned by this NgModule
  imports: [BrowserModule, FormsModule, PluginsModule, routing],
  providers: [ROUTER_PROVIDERS, RadioControlRegistry, appRoutingProviders, {provide: LocationStrategy, useClass: HashLocationStrategy}], // additional providers
  entryComponents: [StatisticComponent],
  bootstrap: [AppComponent]
} )
class IgeModule {
}

// Ahead of Time compile
// platformBrowser().bootstrapModuleFactory( MyAppModuleNgFactory );

// JIT compile long form
platformBrowserDynamic().bootstrapModule( IgeModule );

