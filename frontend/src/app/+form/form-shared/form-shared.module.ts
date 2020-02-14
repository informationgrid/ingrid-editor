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
import {FolderPlugin} from '../dialogs/folder/folder.plugin';
import {DeleteDocsPlugin} from '../dialogs/delete-docs/delete-docs.plugin';
import {IsoViewPlugin} from '../dialogs/isoView/iso-view.plugin';
import {CopyCutPastePlugin} from '../dialogs/copy-cut-paste/copy-cut-paste.plugin';
import {PublishPlugin} from '../dialogs/publish/publish.plugin';
import {UndoPlugin} from '../dialogs/undo/undo.plugin';
import {PrintViewPlugin} from '../dialogs/print-view/print-view.plugin';
import {FormularService} from '../formular.service';
import {CreateFolderComponent} from '../dialogs/folder/create-folder.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ChooseFolderComponent} from '../dialogs/folder/choose-folder/choose-folder.component';
import {BreadcrumbComponent} from '../form-info/breadcrumb/breadcrumb.component';
import {MatInputModule} from '@angular/material/input';


@NgModule({
  declarations: [FormToolbarComponent, CreateFolderComponent, ChooseFolderComponent, BreadcrumbComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    FlexLayoutModule
  ],
  providers: [FormToolbarService, FormPluginsService, NewDocumentPlugin, SavePlugin, FolderPlugin, DeleteDocsPlugin,
    IsoViewPlugin, CopyCutPastePlugin, PublishPlugin, UndoPlugin, PrintViewPlugin, FormularService],
  exports: [FormToolbarComponent, FlexLayoutModule, BreadcrumbComponent, ChooseFolderComponent],
  entryComponents: [CreateFolderComponent]
})
export class FormSharedModule {
}
