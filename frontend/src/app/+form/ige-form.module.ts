import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { routing } from "./ige-form.routing";
import { SharedModule } from "../shared/shared.module";
import { NominatimService } from "../formly/types/map/nominatim.service";
import { ScrollToDirective } from "../directives/scrollTo.directive";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { FormFieldsModule } from "../form-fields/form-fields.module";
import { RouterModule } from "@angular/router";
import { FormlyModule } from "@ngx-formly/core";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { PasteDialogComponent } from "./dialogs/copy-cut-paste/paste-dialog.component";
import { IsoViewComponent } from "./dialogs/isoView/iso-view.component";
import { FormSharedModule } from "./form-shared/form-shared.module";
import { VersionConflictDialogComponent } from "./dialogs/version-conflict-dialog/version-conflict-dialog.component";
import { CreateNodeModule } from "./dialogs/create/create-node.module";
import { AngularSplitModule } from "angular-split";

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
