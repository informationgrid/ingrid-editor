import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { routing } from "./ige-form.routing";
import { SharedModule } from "../shared/shared.module";
import { NominatimService } from "../formly/types/map/nominatim.service";
import { ScrollToDirective } from "../directives/scrollTo.directive";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatRadioModule } from "@angular/material/radio";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { FormFieldsModule } from "../form-fields/form-fields.module";
import { RouterModule } from "@angular/router";
import { FormlyModule } from "@ngx-formly/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { PasteDialogComponent } from "./dialogs/copy-cut-paste/paste-dialog.component";
import { IsoViewComponent } from "./dialogs/iso-view/iso-view.component";
import { FormSharedModule } from "./form-shared/form-shared.module";
import { VersionConflictDialogComponent } from "./dialogs/version-conflict-dialog/version-conflict-dialog.component";
import { CreateNodeModule } from "./dialogs/create/create-node.module";
import { AngularSplitModule } from "angular-split";
import { DialogTemplateModule } from "../shared/dialog-template/dialog-template.module";

@NgModule({
  imports: [
    RouterModule.forChild(routing),
    CommonModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatListModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatCardModule,
    FormlyModule,
    FormFieldsModule,
    FormSharedModule,
    CreateNodeModule,
    AngularSplitModule,
    DialogTemplateModule,
  ],
  declarations: [
    PasteDialogComponent,
    IsoViewComponent,
    ScrollToDirective,
    VersionConflictDialogComponent,
  ],
  providers: [NominatimService],
  exports: [RouterModule, FormsModule, ScrollToDirective],
})
export class IgeFormModule {}
