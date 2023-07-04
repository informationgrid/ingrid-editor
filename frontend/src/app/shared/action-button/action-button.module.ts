import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ActionButtonComponent } from "./action-button.component";

@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule],
  declarations: [ActionButtonComponent],
  exports: [ActionButtonComponent],
})
export class ActionButtonModule {}
