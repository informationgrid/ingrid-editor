import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormToolbarComponent} from './toolbar/form-toolbar.component';
import {FormToolbarService} from './toolbar/form-toolbar.service';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FormPluginsService} from './form-plugins.service';
import {NewDocumentPlugin} from '../dialogs/new-doc/new-doc.plugin';
import {SavePlugin} from '../dialogs/save/save.plugin';
import {FlexLayoutModule} from '@angular/flex-layout';


@NgModule({
  declarations: [FormToolbarComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  providers: [FormToolbarService, FormPluginsService, NewDocumentPlugin, SavePlugin],
  exports: [FormToolbarComponent, FlexLayoutModule]
})
export class FormSharedModule {
}
