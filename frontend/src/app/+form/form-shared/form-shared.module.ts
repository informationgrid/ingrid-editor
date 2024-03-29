/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormToolbarComponent } from "./toolbar/form-toolbar.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";
import { CreateDocumentPlugin } from "../dialogs/create/create-doc.plugin";
import { SavePlugin } from "../dialogs/save/save.plugin";
import { CreateFolderPlugin } from "../dialogs/create/create-folder.plugin";
import { DeleteDocsPlugin } from "../dialogs/delete-docs/delete-docs.plugin";
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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SharedPipesModule } from "../../directives/shared-pipes.module";
import { DashboardDocsHeaderComponent } from "../form-dashboard/dashboard-docs-header/dashboard-docs-header.component";
import { DashboardAddressHeaderComponent } from "../form-dashboard/dashboard-address-header/dashboard-address-header.component";
import { DelayedPublishDialogComponent } from "../dialogs/save/delayed-publish-dialog/delayed-publish-dialog.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { PublishPendingComponent } from "../form-info/publish-pending/publish-pending.component";
import { CreateNodeModule } from "../dialogs/create/create-node.module";
import { BreadcrumbModule } from "../form-info/breadcrumb/breadcrumb.module";
import { TranslocoModule } from "@ngneat/transloco";
import { ActionButtonModule } from "../../shared/action-button/action-button.module";
import { QuickNavbarComponent } from "./form/quick-navbar/quick-navbar.component";
import { ErrorPanelComponent } from "./form/error-panel/error-panel.component";
import { DocumentIconModule } from "../../shared/document-icon/document-icon.module";
import { FormLabelComponent } from "../../formly/wrapper/form-label/form-label.component";
import { LongPressDirective } from "../../directives/longPress.directive";

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
    QuickNavbarComponent,
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
    ActionButtonModule,
    DocumentIconModule,
    FormLabelComponent,
    ErrorPanelComponent,
    LongPressDirective,
  ],
  providers: [
    CreateDocumentPlugin,
    SavePlugin,
    CreateFolderPlugin,
    DeleteDocsPlugin,
    CopyCutPastePlugin,
    PublishPlugin,
    UndoPlugin,
    PrintViewPlugin,
    FormularService,
    HistoryPlugin,
  ],
  exports: [
    FormToolbarComponent,
    IgeFormlyModule,
    FormInfoComponent,
    DynamicFormComponent,
    HeaderTitleRowComponent,
    FormDashboardComponent,
    PublishPendingComponent,
  ],
})
export class FormSharedModule {}
