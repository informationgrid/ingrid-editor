import { Component, inject } from "@angular/core";
import { BehaviourService } from "../../../../app/services/behavior/behaviour.service";
import { MatFormField } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { PageTemplateNoHeaderComponent } from "../../../../app/shared/page-template/page-template-no-header.component";
import { UvpArchiveService } from "./uvp-archive.service";

@Component({
  selector: "ige-uvp-archive",
  imports: [
    MatFormField,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatButton,
    MatRadioGroup,
    MatRadioButton,
    PageTemplateNoHeaderComponent,
  ],
  templateUrl: "./uvp-archive.component.html",
  styleUrl: "./uvp-archive.component.scss",
  providers: [UvpArchiveService],
})
export class UvpArchiveComponent {
  private behaviourService = inject(BehaviourService);

  private uvpArchiveService = inject(UvpArchiveService);

  active = this.behaviourService.getBehaviour("plugin.archive").isActive;
  dateControl = new FormControl<Date>(null);
  choice = new FormControl(null);

  archiveNow() {
    this.uvpArchiveService
      .archive(this.choice.value, this.dateControl.value)
      .subscribe();
  }
}
