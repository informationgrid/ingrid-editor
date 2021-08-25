import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileComponent } from "./profile/profile.component";
import { routing } from "./profile.routing";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { SharedModule } from "../shared/shared.module";
import { ChangeEmailDialogComponent } from "./change-email-dialog/change-email-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ChangeNameDialogComponent } from "./change-name-dialog/change-name-dialog.component";

@NgModule({
  declarations: [
    ProfileComponent,
    ChangeEmailDialogComponent,
    ChangeNameDialogComponent,
  ],
  imports: [
    MatSnackBarModule,
    CommonModule,
    routing,
    PageTemplateModule,
    SharedModule,
    MatDialogModule,
    FormSharedModule,
  ],
})
export class ProfileModule {}
