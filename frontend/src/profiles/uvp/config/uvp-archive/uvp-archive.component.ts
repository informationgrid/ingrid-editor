import { Component, inject } from "@angular/core";
import { BehaviourService } from "../../../../app/services/behavior/behaviour.service";
import { MatFormField } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { PageTemplateNoHeaderComponent } from "../../../../app/shared/page-template/page-template-no-header.component";

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
})
export class UvpArchiveComponent {
  private behaviourService = inject(BehaviourService);

  active = this.behaviourService.getBehaviour("plugin.archive").isActive;
  dateControl = new FormControl("");
  choice = new FormControl("");

  constructor() {
    this.choice.valueChanges.subscribe((value) => {
      if (value === "showAll") {
        this.dateControl.disable();
      } else {
        this.dateControl.enable();
      }
    });
  }

  update() {}
}
