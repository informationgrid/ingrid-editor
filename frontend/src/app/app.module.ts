import {AppComponent} from './app.component';
import {registerLocaleData} from '@angular/common';
import {routing} from './app.router';
import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import {ModalService} from './services/modal/modal.service';
import {HelpComponent} from './help/help.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {environment} from '../environments/environment';
import {ConfigService} from './services/config/config.service';
import {LoginComponent} from './security/login.component';
import {GlobalErrorHandler} from './error-handler';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ErrorDialogComponent} from './dialogs/error/error-dialog.component';
import {IgeError} from './models/ige-error';
import {FormsModule} from '@angular/forms';
import de from '@angular/common/locales/de';
import {AkitaNgDevtools} from '@datorama/akita-ngdevtools';
import {AngularSplitModule} from 'angular-split';
import {FormlyModule} from '@ngx-formly/core';
import {OneColumnWrapperComponent} from './formly/wrapper/one-column-wrapper.component';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {SideMenuComponent} from './side-menu/side-menu.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {SectionWrapper} from './formly/wrapper/section-wrapper.component';
import {ConfirmDialogComponent} from './dialogs/confirm/confirm-dialog.component';
import {MainHeaderComponent} from './main-header/main-header.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';
import {AuthInterceptor} from './security/keycloak/auth.interceptor';
import {SharedDocumentItemModule} from './shared/shared-document-item.module';
import {pluginProvider} from './plugin.provider';
import {InlineHelpWrapperComponent} from './formly/wrapper/inline-help-wrapper/inline-help-wrapper.component';
import {FullWidthWrapperComponent} from './formly/wrapper/full-width-wrapper.component';
import {SessionTimeoutInterceptor} from './services/session-timeout.interceptor';
import {SessionTimeoutInfoComponent} from './main-header/session-timeout-info/session-timeout-info.component';
import {TimePipe} from './directives/time.pipe';
import {FormFieldsModule} from './form-fields/form-fields.module';
import {AnimationWrapper, AnimationWrapperComponent} from './animation-wrapper.component';
import {NG_FORMS_MANAGER_CONFIG, NgFormsManagerConfig} from '@ngneat/forms-manager';

registerLocaleData(de);

export function ConfigLoader(configService: ConfigService) {
  return () => {

    return configService.load(environment.configFile)
      .then(() => configService.getCurrentUserInfo())
      .then(userInfo => {

        // an admin role has no constraints
        if (configService.isAdmin()) {

          if (userInfo.assignedCatalogs.length === 0) {

          }

        } else {

          // check if user has any assigned catalog
          if (userInfo.assignedCatalogs.length === 0) {
            const error = new IgeError();
            error.setMessage('The user has no assigned catalog. An administrator has to assign a catalog to this user.');
            throw error;
          }
        }
      })
      .catch(err => {
        // remove loading spinner and rethrow error
        document.getElementsByClassName('app-loading').item(0).innerHTML = 'An error occurred';
        throw new IgeError(err);
      });
  };
}

@NgModule({
  // directives, components, and pipes owned by this NgModule
  declarations: [AppComponent, HelpComponent, LoginComponent, ErrorDialogComponent,
    ConfirmDialogComponent,
    OneColumnWrapperComponent, FullWidthWrapperComponent, SectionWrapper, InlineHelpWrapperComponent,
    SideMenuComponent,
    TimePipe,
    MainHeaderComponent,
    SessionTimeoutInfoComponent,
    AnimationWrapperComponent],
  imports: [
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AngularSplitModule,
    MatTooltipModule,
    MatDialogModule,
    // ReactiveFormsModule,
    // angular
    BrowserModule, BrowserAnimationsModule, HttpClientModule, HttpClientXsrfModule,
    // Flex layout
    FlexLayoutModule,
    FormlyModule.forRoot({
      wrappers: [
        {name: 'inline-help', component: InlineHelpWrapperComponent},
        {name: 'panel', component: OneColumnWrapperComponent},
        {name: 'full-panel', component: FullWidthWrapperComponent},
        {name: 'section', component: SectionWrapper},
        {name: 'animation', component: AnimationWrapperComponent}
      ],
      manipulators: [
        {class: AnimationWrapper, method: 'run'}
      ]
    }),
    FormlyMaterialModule,
    // Material
    MatToolbarModule, MatIconModule, MatButtonModule, MatDialogModule, MatSidenavModule, MatRadioModule, MatCheckboxModule,
    MatListModule, MatFormFieldModule, MatInputModule, MatCardModule, MatAutocompleteModule,
    // IGE-Modules
    routing, FormsModule, MatTabsModule, MatMenuModule, SharedDocumentItemModule, FormFieldsModule
  ],
  providers: [
    // appRoutingProviders,
    // make sure we are authenticated by keycloak before bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [ConfigService, ModalService],
      multi: true
    },
    // set locale for dates
    {
      provide: LOCALE_ID,
      useValue: 'de-de'
    },
    // add authorization header to all requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // handle session timeouts
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionTimeoutInterceptor,
      multi: true
    },
    // overwrite global error handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {
        panelClass: 'mat-dialog-override',
        hasBackdrop: true
      }
    },

    {
      provide: NG_FORMS_MANAGER_CONFIG,
      useValue: new NgFormsManagerConfig({
        debounceTime: 0 // defaults to 300
      })
    },

    // PLUGINS
    pluginProvider

  ], // additional providers

  bootstrap: [AppComponent],
  entryComponents: [ErrorDialogComponent, ConfirmDialogComponent]
})

export class AppModule {
}
