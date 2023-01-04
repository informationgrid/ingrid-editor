import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogTemplateComponent } from "./dialog-template.component";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { FlexModule } from "@angular/flex-layout";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [DialogTemplateComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FlexModule,
    DragDropModule,
  ],
  exports: [DialogTemplateComponent],
})
export class DialogTemplateModule {}
