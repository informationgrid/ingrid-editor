import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileComponent } from "./profile/profile.component";
import { routing } from "./profile.routing";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { SharedModule } from "../shared/shared.module";
import { MatDialogModule } from "@angular/material/dialog";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ChangeNameDialogComponent } from "./change-name-dialog/change-name-dialog.component";
import { EmailformComponent } from "../emailform/emailform.component";

@NgModule({
  declarations: [
    ProfileComponent,
    ChangeNameDialogComponent,
    EmailformComponent,
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
