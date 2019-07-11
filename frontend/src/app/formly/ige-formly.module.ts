import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {IgeFormModule} from '../+form/ige-form.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatButtonModule, MatDialogModule} from '@angular/material';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {FormlyModule} from '@ngx-formly/core';
import {OneColumnWrapperComponent} from './wrapper/one-column-wrapper.component';
import {ContextHelpComponent} from '../+demo-layout/form/context-help/context-help.component';


@NgModule({
  imports: [
    ReactiveFormsModule,
    IgeFormModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatDialogModule, MatButtonModule,
    FormlyMaterialModule,
    FormlyModule.forRoot({
      wrappers: [
        { name: 'panel', component: OneColumnWrapperComponent },
      ],
    })
  ],
  declarations: [OneColumnWrapperComponent, ContextHelpComponent],
  entryComponents: [ContextHelpComponent],
  exports: [
    ReactiveFormsModule,
    FormlyModule
  ]
})
export class IgeFormlyModule {
}
