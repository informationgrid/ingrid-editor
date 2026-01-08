import { Component, computed, inject, resource } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DataSiteService } from "./data-site.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { FormStateService } from "../../../../app/+form/form-state.service";
import { JsonPipe } from "@angular/common";
import { CredentialsDialogComponent } from "../../../../app/formly/types/update-get-capabilities/credentials-dialog/credentials-dialog.component";
import { filter, tap } from "rxjs/operators";
import { switchMap } from "rxjs";

@Component({
  selector: "ige-export-data-cite-dialog",
  imports: [
    DialogTemplateComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    JsonPipe,
  ],
  templateUrl: "./export-data-cite-dialog.component.html",
  styleUrl: "./export-data-cite-dialog.component.scss",
})
export class ExportDataCiteDialogComponent {
  dlgRef = inject(MatDialogRef<ExportDataCiteDialogComponent>);
  dataSiteService = inject(DataSiteService);
  formService = inject(FormStateService);
  dialog = inject(MatDialog);

  username = "";
  password = "";

  documentResource = resource({
    params: () => ({
      value: this.formService.getForm().value,
      metadata: this.formService.metadata(),
    }),
    loader: ({ params }) =>
      this.dataSiteService.createDataCite(params.value, params.metadata),
  });
  document = computed(() => this.documentResource.value());

  submit() {
    this.dialog
      .open(CredentialsDialogComponent, { width: "300px" })
      .afterClosed()
      .pipe(
        filter((result) => result),
        switchMap((result) =>
          this.dataSiteService.uploadDOI(
            result.username,
            result.password,
            this.document(),
          ),
        ),
      )
      .subscribe((doi) => {
        this.dlgRef.close(true);
      });
  }
}
