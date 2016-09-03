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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ROUTER_PROVIDERS} from "@angular/router/src/router_module";
import {RadioControlRegistry} from "@angular/forms/src/directives/radio_control_value_accessor";
import {DashboardComponent} from "./+dashboard/dashboard.component";
import {DynamicFormComponent} from "./form/dynamic-form.component";
import {PluginsModule} from "./plugins/plugins.module";
import {StatisticComponent} from "./plugins/statistic/statistic.component";
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {TranslateModule} from "ng2-translate/ng2-translate";
import {HttpModule} from "@angular/http";
import {FormToolbarComponent} from "./form/toolbar/form-toolbar.component";
import {DynamicFieldComponent} from "./form/dynamic-field.component";
import {MenuComponent} from "./menu/menu.component";
import {CustomInput} from "./form/table/table.component";
import {LeafletComponent} from "./form/leaflet/leaflet.component";
import {AgGridNg2} from "ag-grid-ng2";

@NgModule( {
  declarations: [DashboardComponent, DynamicFormComponent, AppComponent, AgGridNg2, StatisticComponent, FormToolbarComponent,DynamicFieldComponent, MenuComponent, CustomInput, LeafletComponent, DynamicFormComponent], // directives, components, and pipes owned by this NgModule
  imports: [BrowserModule, HttpModule, FormsModule, ReactiveFormsModule, PluginsModule, routing, TranslateModule.forRoot()],
  providers: [ROUTER_PROVIDERS, RadioControlRegistry, appRoutingProviders, {
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }], // additional providers
  entryComponents: [StatisticComponent],
  bootstrap: [AppComponent]
} )
class IgeModule {
}

// Ahead of Time compile
// platformBrowser().bootstrapModuleFactory( IgeModuleNgFactory );

// JIT compile long form
platformBrowserDynamic().bootstrapModule( IgeModule );
