import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { JobHandlerHeaderComponent } from "./job-handler-header.component";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
  declarations: [JobHandlerHeaderComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  exports: [JobHandlerHeaderComponent],
})
export class JobHandlerHeaderModule {}
