import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UploadComponent } from "./upload.component";
import { UploadItemComponent } from "./upload-item/upload-item.component";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";
import { FlexModule } from "@angular/flex-layout";
import { NgxFlowModule } from "@flowjs/ngx-flow";

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    FlexModule,
    NgxFlowModule,
  ],
  declarations: [UploadComponent, UploadItemComponent],
  exports: [UploadComponent],
})
export class UploadModule {}
