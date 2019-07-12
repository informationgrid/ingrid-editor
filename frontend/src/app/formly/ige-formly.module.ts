import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {IgeFormModule} from '../+form/ige-form.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatAutocompleteModule, MatButtonModule, MatDialogModule, MatInputModule} from '@angular/material';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {FormlyModule} from '@ngx-formly/core';
import {ContextHelpComponent} from '../+demo-layout/form/context-help/context-help.component';


@NgModule({
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    IgeFormModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatDialogModule, MatButtonModule, MatAutocompleteModule,
    FormlyMaterialModule,
    FormlyModule.forChild(),
    /*FormlyModule.forChild({
      wrappers: [
        { name: 'panel', component: OneColumnWrapperComponent },
      ],
    })*/
  ],
  declarations: [ContextHelpComponent],
  entryComponents: [ContextHelpComponent],
  exports: [
    ReactiveFormsModule,
    FormlyModule
  ]
})
export class IgeFormlyModule {
}
