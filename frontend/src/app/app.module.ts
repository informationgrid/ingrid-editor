import {AppComponent} from './app.component';
import {HashLocationStrategy, LocationStrategy, registerLocaleData} from '@angular/common';
import {appRoutingProviders, routing} from './app.router';
import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {MenuComponent} from './menu/menu.component';
import {ModalService} from './services/modal/modal.service';
import {HelpComponent} from './help/help.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {environment} from '../environments/environment';
import {ConfigService} from './services/config/config.service';
import {LoginComponent} from './security/login.component';
import {GlobalErrorHandler} from './error-handler';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {
  MAT_DATE_LOCALE,
  MatButtonModule, MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ErrorDialogComponent} from './dialogs/error/error-dialog.component';
import {IgeError} from './models/ige-error';
import {FormsModule} from '@angular/forms';
import de from '@angular/common/locales/de';
import {AkitaNgDevtools} from "@datorama/akita-ngdevtools";
import {AngularSplitModule} from "angular-split";
import {SearchBarComponent} from "./+dashboard/search-bar/search-bar.component";
import {DeleteDialogComponent} from "./+behaviours/toolbar/deleteDocs/delete-dialog.component";
import {FormlyModule} from '@ngx-formly/core';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {OneColumnWrapperComponent} from './formly/wrapper/one-column-wrapper.component';

registerLocaleData(de);

export function ConfigLoader(configService: ConfigService, modal: ModalService) {
  return () => {

    return configService.load(environment.configFile)
      .then(() => configService.getCurrentUserInfo())
      .then(userInfo => {

        // an admin role has no constraints
        if (!configService.isAdmin()) {

          // check if user has any assigned catalog
          if (!userInfo.assignedCatalogs || userInfo.assignedCatalogs.length === 0) {
            const error = new IgeError();
            error.setMessage('The user has no assigned catalog. An administrator has to assign a catalog to this user.');
            throw error;
          }
        }
      })
      .catch(err => {
        // remove loading spinner and rethrow error
        document.getElementsByClassName('app-loading').item(0).remove();
        throw new IgeError(err);
      });
  }
}

@NgModule({
  // directives, components, and pipes owned by this NgModule
  declarations: [AppComponent, HelpComponent, MenuComponent, LoginComponent, ErrorDialogComponent, SearchBarComponent, DeleteDialogComponent,
  OneColumnWrapperComponent],
  imports: [
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AngularSplitModule.forRoot(),
    // angular
    BrowserModule, BrowserAnimationsModule, HttpClientModule, HttpClientXsrfModule,
    // Flex layout
    FlexLayoutModule,
    FormlyModule.forRoot({
      wrappers: [
        { name: 'panel', component: OneColumnWrapperComponent },
      ]
    }),
    FormlyMaterialModule,
    // Material
    MatToolbarModule, MatIconModule, MatButtonModule, MatDialogModule, MatSidenavModule, MatListModule, MatFormFieldModule, MatInputModule, MatCardModule,
    // IGE-Modules
    // IgeFormModule, FormFieldsModule,
    routing, FormsModule
  ],
  providers: [
    appRoutingProviders,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    // make sure we are authenticated by keycloak before bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [ConfigService, ModalService],
      multi: true
    },
    // date locale
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'de'
    },
    // add authorization header to all requests
    /*{
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },*/
    // overwrite global error handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }/*
    {
      provide: DocumentDataService,
      useClass: environment.production ? DocumentDataService : DocumentMockService
    },
    {
      provide: ConfigDataService,
      useClass: environment.production ? ConfigDataService : ConfigMockService
    },
    {
      provide: CodelistDataService,
      useClass: environment.production ? CodelistDataService : CodelistMockService
    },
    {
      provide: RoleDataService,
      useClass: environment.production ? RoleDataService : RoleMockService
    },
    {
      provide: BehaviorDataService,
      useClass: environment.production ? BehaviorDataService : BehaviorMockService
    },
    {
      provide: CatalogDataService,
      useClass: environment.production ? CatalogDataService : CatalogMockService
    },
    {
      provide: UserDataService,
      useClass: environment.production ? UserDataService : UserMockService
    }*/

  ], // additional providers

  bootstrap: [AppComponent],
  entryComponents: [ErrorDialogComponent, DeleteDialogComponent]
})

export class AppModule {
}
