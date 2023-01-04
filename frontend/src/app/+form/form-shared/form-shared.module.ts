import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormToolbarComponent } from "./toolbar/form-toolbar.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatDividerModule } from "@angular/material/divider";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { FormPluginsService } from "./form-plugins.service";
import { CreateDocumentPlugin } from "../dialogs/create/create-doc.plugin";
import { SavePlugin } from "../dialogs/save/save.plugin";
import { FlexLayoutModule } from "@angular/flex-layout";
import { CreateFolderPlugin } from "../dialogs/create/create-folder.plugin";
import { DeleteDocsPlugin } from "../dialogs/delete-docs/delete-docs.plugin";
import { IsoViewPlugin } from "../dialogs/isoView/iso-view.plugin";
import { CopyCutPastePlugin } from "../dialogs/copy-cut-paste/copy-cut-paste.plugin";
import { PublishPlugin } from "../dialogs/save/publish.plugin";
import { UndoPlugin } from "../dialogs/undo/undo.plugin";
import { PrintViewPlugin } from "../dialogs/print-view/print-view.plugin";
import { FormularService } from "../formular.service";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { IgeFormlyModule } from "../../formly/ige-formly.module";
import { FormInfoComponent } from "../form-info/form-info.component";
import { HeaderNavigationComponent } from "../form-info/header-navigation/header-navigation.component";
import { HeaderTitleRowComponent } from "../form-info/header-title-row/header-title-row.component";
import { HeaderMoreComponent } from "../form-info/header-more/header-more.component";
import { FormMessageComponent } from "../form-info/form-message/form-message.component";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { SharedModule } from "../../shared/shared.module";
import { HistoryPlugin } from "../dialogs/history/history.plugin";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { DynamicFormComponent } from "./form/dynamic-form.component";
import { SidebarComponent } from "../sidebars/sidebar.component";
import { FormDashboardComponent } from "../form-dashboard/form-dashboard.component";
import { FolderDashboardComponent } from "./folder/folder-dashboard.component";
import { AngularSplitModule } from "angular-split";
import { FormComponent } from "../form/form.component";
import { FormToolbarService } from "./toolbar/form-toolbar.service";
import { formPluginProvider } from "../../form-plugin.provider";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { SharedPipesModule } from "../../directives/shared-pipes.module";
import { DashboardDocsHeaderComponent } from "../form-dashboard/dashboard-docs-header/dashboard-docs-header.component";
import { DashboardAddressHeaderComponent } from "../form-dashboard/dashboard-address-header/dashboard-address-header.component";
import { DelayedPublishDialogComponent } from "../dialogs/save/delayed-publish-dialog/delayed-publish-dialog.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { PublishPendingComponent } from "../form-info/publish-pending/publish-pending.component";
import { CreateNodeModule } from "../dialogs/create/create-node.module";
import { BreadcrumbModule } from "../form-info/breadcrumb/breadcrumb.module";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  declarations: [
    FormToolbarComponent,
    FormComponent,
    FormInfoComponent,
    HeaderNavigationComponent,
    HeaderTitleRowComponent,
    HeaderMoreComponent,
    FormMessageComponent,
    DynamicFormComponent,
    SidebarComponent,
    FormDashboardComponent,
    DashboardDocsHeaderComponent,
    DashboardAddressHeaderComponent,
    FolderDashboardComponent,
    DelayedPublishDialogComponent,
    PublishPendingComponent,
  ],
  imports: [
    CommonModule,
    AngularSplitModule,
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
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    SharedPipesModule,
    MatDatepickerModule,
    CreateNodeModule,
    BreadcrumbModule,
    TranslocoModule,
  ],
  providers: [
    FormToolbarService,
    FormPluginsService,
    CreateDocumentPlugin,
    SavePlugin,
    CreateFolderPlugin,
    DeleteDocsPlugin,
    IsoViewPlugin,
    CopyCutPastePlugin,
    PublishPlugin,
    UndoPlugin,
    PrintViewPlugin,
    FormularService,
    HistoryPlugin,

    // FORM-PLUGINS
    formPluginProvider,
  ],
  exports: [
    FormToolbarComponent,
    FlexLayoutModule,
    IgeFormlyModule,
    FormInfoComponent,
    DynamicFormComponent,
    HeaderTitleRowComponent,
    FormDashboardComponent,
    PublishPendingComponent,
  ],
})
export class FormSharedModule {}
