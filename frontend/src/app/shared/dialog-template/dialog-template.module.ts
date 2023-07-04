import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogTemplateComponent } from "./dialog-template.component";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [DialogTemplateComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    DragDropModule,
  ],
  exports: [DialogTemplateComponent],
})
export class DialogTemplateModule {}
