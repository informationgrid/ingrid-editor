import { Component, computed, inject, resource } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DataSiteService } from "./data-site.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { FormStateService } from "../../../../app/+form/form-state.service";
import { CredentialsDialogComponent } from "../../../../app/formly/types/update-get-capabilities/credentials-dialog/credentials-dialog.component";
import { filter } from "rxjs/operators";
import { switchMap } from "rxjs";
import { rxResource } from "@angular/core/rxjs-interop";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { JsonViewComponent } from "../../../../app/shared/json-view/json-view.component";

@Component({
  selector: "ige-export-data-cite-dialog",
  imports: [
    DialogTemplateComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinner,
    JsonViewComponent,
  ],
  templateUrl: "./export-data-cite-dialog.component.html",
  styleUrl: "./export-data-cite-dialog.component.scss",
})
export class ExportDataCiteDialogComponent {
  dlgRef = inject(MatDialogRef<ExportDataCiteDialogComponent>);
  dataSiteService = inject(DataSiteService);
  formService = inject(FormStateService);
  dialog = inject(MatDialog);

  documentResource = resource({
    params: () => ({
      value: this.formService.getForm().value,
      metadata: this.formService.metadata(),
    }),
    loader: ({ params }) =>
      this.dataSiteService.createDataCite(params.value, params.metadata),
  });
  document = computed(() => this.documentResource.value());

  doiExistsResource = rxResource({
    params: () => ({
      doi: this.formService.getForm().value.publication.doi,
    }),
    stream: ({ params }) => this.dataSiteService.doiExists(params.doi),
  });

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
            this.doiExistsResource.value(),
          ),
        ),
      )
      .subscribe(() => this.dlgRef.close(true));
  }
}
