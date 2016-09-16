import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import "../node_modules/ag-grid/dist/styles/ag-grid.css";
import "../node_modules/ag-grid/dist/styles/theme-blue.css";
import "../node_modules/leaflet/dist/leaflet.css";
import "../styles.css";
import {AppComponent} from "./app.component";
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {appRoutingProviders, routing} from "./router";
import {ROUTER_PROVIDERS} from "@angular/router/src/router_module";
import {RadioControlRegistry} from "@angular/forms/src/directives/radio_control_value_accessor";
import {PluginsModule} from "./plugins/plugins.module";
import {StatisticComponent} from "./plugins/statistic/statistic.component";
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {TranslateModule} from "ng2-translate/ng2-translate";
import {HttpModule} from "@angular/http";
import {MenuComponent} from "./menu/menu.component";
import {IgeFormModule} from "./+form/ige-form.module";
import {DashboardModule} from "./+dashboard/dashboard.module";
import {FieldsModule} from "./+fields/fields.module";
import {FormToolbarService} from "./+form/toolbar/form-toolbar.service";
import {StorageService} from "./services/storage/storage.service";

@NgModule({
  declarations: [AppComponent, StatisticComponent, MenuComponent], // directives, components, and pipes owned by this NgModule
  imports: [BrowserModule, HttpModule, IgeFormModule, DashboardModule, FieldsModule, PluginsModule, routing, TranslateModule.forRoot()],
  providers: [ROUTER_PROVIDERS, RadioControlRegistry, appRoutingProviders, FormToolbarService, StorageService, {
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }], // additional providers
  entryComponents: [StatisticComponent],
  bootstrap: [AppComponent]
})
class IgeModule {
}

// Ahead of Time compile
// platformBrowser().bootstrapModuleFactory( IgeModuleNgFactory );

// JIT compile long form
platformBrowserDynamic().bootstrapModule(IgeModule);
