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
import {CreateDocumentPlugin} from '../dialogs/create/create-doc.plugin';
import {SavePlugin} from '../dialogs/save/save.plugin';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CreateFolderPlugin} from '../dialogs/create/create-folder.plugin';
import {DeleteDocsPlugin} from '../dialogs/delete-docs/delete-docs.plugin';
import {IsoViewPlugin} from '../dialogs/isoView/iso-view.plugin';
import {CopyCutPastePlugin} from '../dialogs/copy-cut-paste/copy-cut-paste.plugin';
import {PublishPlugin} from '../dialogs/publish/publish.plugin';
import {UndoPlugin} from '../dialogs/undo/undo.plugin';
import {PrintViewPlugin} from '../dialogs/print-view/print-view.plugin';
import {FormularService} from '../formular.service';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BreadcrumbComponent} from '../form-info/breadcrumb/breadcrumb.component';
import {MatInputModule} from '@angular/material/input';
import {IgeFormlyModule} from '../../formly/ige-formly.module';
import {FormInfoComponent} from '../form-info/form-info.component';
import {HeaderNavigationComponent} from '../form-info/header-navigation/header-navigation.component';
import {HeaderTitleRowComponent} from '../form-info/header-title-row/header-title-row.component';
import {HeaderMoreComponent} from '../form-info/header-more/header-more.component';
import {FormMessageComponent} from '../form-info/form-message/form-message.component';
import {MatTabsModule} from '@angular/material/tabs';
import {SharedModule} from '../../shared/shared.module';
import {DestinationSelectionComponent} from '../dialogs/create/destination-selection/destination-selection.component';
import {HeaderTitleRowMinComponent} from '../form-info/header-title-row-min/header-title-row-min.component';
import {HistoryPlugin} from '../dialogs/history/history.plugin';
import {MatTooltipModule} from '@angular/material/tooltip';


@NgModule({
  declarations: [
    FormToolbarComponent, BreadcrumbComponent,
    FormInfoComponent, HeaderNavigationComponent, HeaderTitleRowComponent, HeaderMoreComponent, HeaderTitleRowMinComponent,
    FormMessageComponent, DestinationSelectionComponent
  ],
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
    FlexLayoutModule,
    IgeFormlyModule,
    MatTabsModule,
    SharedModule,
    MatTooltipModule
  ],
  providers: [FormToolbarService, FormPluginsService, CreateDocumentPlugin, SavePlugin, CreateFolderPlugin, DeleteDocsPlugin,
    IsoViewPlugin, CopyCutPastePlugin, PublishPlugin, UndoPlugin, PrintViewPlugin, FormularService, HistoryPlugin],
  exports: [FormToolbarComponent, FlexLayoutModule, BreadcrumbComponent, IgeFormlyModule,
    FormInfoComponent, DestinationSelectionComponent],
  entryComponents: []
})
export class FormSharedModule {
}
