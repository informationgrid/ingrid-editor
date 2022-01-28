import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormToolbarComponent } from "./toolbar/form-toolbar.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";
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
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { IgeFormlyModule } from "../../formly/ige-formly.module";
import { FormInfoComponent } from "../form-info/form-info.component";
import { HeaderNavigationComponent } from "../form-info/header-navigation/header-navigation.component";
import { HeaderTitleRowComponent } from "../form-info/header-title-row/header-title-row.component";
import { HeaderMoreComponent } from "../form-info/header-more/header-more.component";
import { FormMessageComponent } from "../form-info/form-message/form-message.component";
import { MatTabsModule } from "@angular/material/tabs";
import { SharedModule } from "../../shared/shared.module";
import { HistoryPlugin } from "../dialogs/history/history.plugin";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DynamicFormComponent } from "./form/dynamic-form.component";
import { SidebarComponent } from "../sidebars/sidebar.component";
import { FormDashboardComponent } from "../form-dashboard/form-dashboard.component";
import { FolderDashboardComponent } from "./folder/folder-dashboard.component";
import { AngularSplitModule } from "angular-split";
import { FormComponent } from "../form/form.component";
import { FormToolbarService } from "./toolbar/form-toolbar.service";
import { formPluginProvider } from "../../form-plugin.provider";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { BreadcrumbComponent } from "../form-info/breadcrumb/breadcrumb.component";
import { DestinationSelectionComponent } from "../dialogs/create/destination-selection/destination-selection.component";
import { CreateNodeComponent } from "../dialogs/create/create-node.component";
import { SharedPipesModule } from "../../directives/shared-pipes.module";
import { DashboardDocsHeaderComponent } from "../form-dashboard/dashboard-docs-header/dashboard-docs-header.component";
import { DashboardAddressHeaderComponent } from "../form-dashboard/dashboard-address-header/dashboard-address-header.component";

@NgModule({
  declarations: [
    FormToolbarComponent,
    BreadcrumbComponent,
    FormComponent,
    CreateNodeComponent,
    FormInfoComponent,
    HeaderNavigationComponent,
    HeaderTitleRowComponent,
    HeaderMoreComponent,
    FormMessageComponent,
    DestinationSelectionComponent,
    DynamicFormComponent,
    SidebarComponent,
    FormDashboardComponent,
    DashboardDocsHeaderComponent,
    DashboardAddressHeaderComponent,
    FolderDashboardComponent,
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
    BreadcrumbComponent,
    IgeFormlyModule,
    FormInfoComponent,
    DestinationSelectionComponent,
    DynamicFormComponent,
    HeaderTitleRowComponent,
    FormDashboardComponent,
  ],
})
export class FormSharedModule {}
