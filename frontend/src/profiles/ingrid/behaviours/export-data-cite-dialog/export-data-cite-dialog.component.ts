import { Component, computed, inject, resource } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatDialogRef } from "@angular/material/dialog";
import { DataSiteService } from "./data-site.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { FormStateService } from "../../../../app/+form/form-state.service";
import { JsonPipe } from "@angular/common";

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
    this.dataSiteService
      .uploadDOI(this.username, this.password, {})
      .subscribe((doi) => {
        this.dlgRef.close(true);
      });
  }
}
