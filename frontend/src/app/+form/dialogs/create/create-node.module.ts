import { NgModule } from "@angular/core";
import { CreateNodeComponent } from "./create-node.component";
import { DestinationSelectionComponent } from "./destination-selection/destination-selection.component";
import { AddressTemplateComponent } from "./address-template/address-template.component";
import { DocumentTemplateComponent } from "./document-template/document-template.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { BreadcrumbModule } from "../../form-info/breadcrumb/breadcrumb.module";
import { ReactiveFormsModule } from "@angular/forms";
import { FlexModule } from "@angular/flex-layout";
import { MatFormFieldModule } from "@angular/material/form-field";
import { SharedDocumentItemModule } from "../../../shared/shared-document-item.module";
import { MatInputModule } from "@angular/material/input";
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
