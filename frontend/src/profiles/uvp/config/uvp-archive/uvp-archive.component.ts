/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, inject, signal } from "@angular/core";
import { BehaviourService } from "../../../../app/services/behavior/behaviour.service";
import { MatFormField } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { PageTemplateNoHeaderComponent } from "../../../../app/shared/page-template/page-template-no-header.component";
import { UvpArchiveService } from "./uvp-archive.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { switchMap } from "rxjs";

@UntilDestroy()
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
  numOfDatasetsHint = signal<string>("");

  constructor() {
    this.dateControl.valueChanges
      .pipe(
        untilDestroyed(this),
        switchMap((value) =>
          this.uvpArchiveService.checkDatasetsBeforeDecisionDate(value),
        ),
      )
      .subscribe((value) => {
        this.numOfDatasetsHint.set(`${value} Verfahren werden archiviert`);
      });
  }

  archiveNow() {
    this.uvpArchiveService
      .archive(this.choice.value, this.dateControl.value)
      .subscribe();
  }
}
