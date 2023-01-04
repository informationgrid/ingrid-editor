import { NgModule } from "@angular/core";
import { CreateNodeComponent } from "./create-node.component";
import { DestinationSelectionComponent } from "./destination-selection/destination-selection.component";
import { AddressTemplateComponent } from "./address-template/address-template.component";
import { DocumentTemplateComponent } from "./document-template/document-template.component";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { CommonModule } from "@angular/common";
import { BreadcrumbModule } from "../../form-info/breadcrumb/breadcrumb.module";
import { ReactiveFormsModule } from "@angular/forms";
import { FlexModule } from "@angular/flex-layout";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { SharedDocumentItemModule } from "../../../shared/shared-document-item.module";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { SharedPipesModule } from "../../../directives/shared-pipes.module";
import { SharedModule } from "../../../shared/shared.module";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [
    CreateNodeComponent,
    DestinationSelectionComponent,
    AddressTemplateComponent,
    DocumentTemplateComponent,
  ],
  imports: [
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    BreadcrumbModule,
    ReactiveFormsModule,
    FlexModule,
    MatFormFieldModule,
    SharedDocumentItemModule,
    MatInputModule,
    SharedPipesModule,
    SharedModule,
    DragDropModule,
  ],
  exports: [DestinationSelectionComponent],
})
export class CreateNodeModule {}
