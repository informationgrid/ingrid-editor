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
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { BehaviourService } from "../../../../app/services/behavior/behaviour.service";
import { MatFormField } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { PageTemplateNoHeaderComponent } from "../../../../app/shared/page-template/page-template-no-header.component";
import { UvpArchiveService } from "./uvp-archive.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { switchMap } from "rxjs";
import { ConfigService } from "../../../../app/services/config/config.service";
import { map, tap } from "rxjs/operators";
import { RxStompService } from "../../../../app/rx-stomp.service";
import { BaseLogResult } from "../../../../app/shared/base-log-result";
import { DatePipe } from "@angular/common";
import { TranslocoService } from "@jsverse/transloco";

@UntilDestroy()
@Component({
  selector: "ige-uvp-archive",
  imports: [
    MatFormField,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatButton,
    PageTemplateNoHeaderComponent,
    DatePipe,
  ],
  templateUrl: "./uvp-archive.component.html",
  styleUrl: "./uvp-archive.component.scss",
  providers: [UvpArchiveService],
})
export class UvpArchiveComponent implements OnInit {
  private behaviourService = inject(BehaviourService);
  private uvpArchiveService = inject(UvpArchiveService);
  private rxStompService = inject(RxStompService);
  private transloco = inject(TranslocoService);

  active = computed<boolean>(() => {
    const archivePlugin = this.behaviourService.getBehaviour("plugin.archive");
    return archivePlugin.isActive && archivePlugin.data["showInPortal"];
  });
  dateControl = new FormControl<Date>(null);
  numOfDatasetsHint = signal<string>("");
  status = signal<BaseLogResult>(null);
  explanation = computed<string>(() => {
    const type =
      this.behaviourService.getBehaviour("plugin.uvp.archive").data[
        "uvpArchiveType"
      ];
    return this.transloco.translate("uvp.archive." + type);
  });

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

  ngOnInit(): void {
    this.rxStompService
      .watch(`/topic/uvp/archiveStatus/${ConfigService.catalogId}`)
      .pipe(
        untilDestroyed(this),
        map((msg) => JSON.parse(msg.body)),
        tap((data) => this.status.set(data)),
      )
      .subscribe();
  }

  archiveNow() {
    this.uvpArchiveService.archive(this.dateControl.value).subscribe();
  }
}
