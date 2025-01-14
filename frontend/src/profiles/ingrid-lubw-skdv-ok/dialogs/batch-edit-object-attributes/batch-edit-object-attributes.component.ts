import { Component, computed, inject, Signal } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { NgForOf } from "@angular/common";
import { CodelistService } from "../../../../app/services/codelist/codelist.service";
import { CodelistStore } from "../../../../app/store/codelist/codelist.store";
import { CodelistEntry } from "../../../../app/store/codelist/codelist.model";

@Component({
  selector: "ige-batch-edit-object-attributes",
  imports: [
    DialogTemplateComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
  ],
  templateUrl: "./batch-edit-object-attributes.component.html",
  styleUrl: "./batch-edit-object-attributes.component.scss",
})
export class BatchEditObjectAttributesComponent {
  codelistStore = inject(CodelistStore);
  categories: Signal<CodelistEntry[]> = computed(() => {
    return this.codelistStore.entityMap()["30003"].entries;
  });

  steps: any[] = [];
  submit() {}
}
