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
import { KeycloakService } from './security/keycloak/keycloak.service';
import { environment } from '../environments/environment';
import { ConfigService } from './services/config.service';
import { ModalModule, PopoverModule } from 'ngx-bootstrap';
import { CatalogModule } from './+catalog/catalog.module';
import { LoginComponent } from './security/login.component';
import { GlobalErrorHandler } from './error-handler';
import { GrowlModule, TreeModule } from 'primeng/primeng';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { AuthInterceptor } from './security/keycloak/auth.interceptor';
import { ProfileService } from './services/profile.service';

export function ConfigLoader(configService: ConfigService) {
  return () => {
    return configService.load(environment.configFile).catch(err => {
      console.error('Config could not be loaded', err);
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
    StorageDummyService, BehavioursDefault, ModalService, ApiService, FormularService, ProfileService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    // make sure we are authenticated by keycloak before bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
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
    }
  ], // additional providers

  bootstrap: [AppComponent]
})

export class AppModule {
}
