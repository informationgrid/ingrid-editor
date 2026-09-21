/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { BehaviourService } from "../../../../app/services/behavior/behaviour.service";
import { MatFormField } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { PageTemplateNoHeaderComponent } from "../../../../app/shared/page-template/page-template-no-header.component";
import { UvpArchiveService } from "./uvp-archive.service";
import { Router } from "@angular/router";
import { switchMap } from "rxjs";
import { ConfigService } from "../../../../app/services/config/config.service";
import { filter, map, tap } from "rxjs/operators";
import { RxStompService } from "../../../../app/rx-stomp.service";
import { BaseLogResult } from "../../../../app/shared/base-log-result";
import { DatePipe } from "@angular/common";
import { TranslocoService } from "@jsverse/transloco";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface ArchivedDataset {
  id: number;
  docId?: number;
  uuid?: string;
  title?: string;
  type?: string;
}

export interface AutoArchiveLogResult extends BaseLogResult {
  report?: ArchivedDataset[];
}

@Component({
  selector: "ige-uvp-archive",
  imports: [
    MatFormField,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatButton,
    MatDividerModule,
    MatListModule,
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
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  active = computed<boolean>(() => {
    const archivePlugin = this.behaviourService.getBehaviour("plugin.archive");
    return archivePlugin.isActive() && archivePlugin.data["showInPortal"];
  });
  dateControl = new FormControl<Date>(null, Validators.required);
  numOfDatasetsHint = signal<string>("");
  status = signal<BaseLogResult>(null);
  autoArchiveStatus = signal<AutoArchiveLogResult>(null);
  explanation = computed<string>(() => {
    const type =
      this.behaviourService.getBehaviour("plugin.uvp.archive")?.data?.[
        "uvpArchiveType"
      ] ?? "showAll";
    return this.transloco.translate("uvp.archive." + type);
  });

  constructor() {
    this.dateControl.valueChanges
      .pipe(
        filter((value) => value instanceof Date && !isNaN(value.getTime())),
        switchMap((value) =>
          this.uvpArchiveService.checkDatasetsBeforeDecisionDate(value),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.numOfDatasetsHint.set(`${value} Verfahren werden archiviert`);
      });
  }

  ngOnInit(): void {
    this.uvpArchiveService
      .getAutomaticArchiveInfo()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((res: any) => {
          if (!res?.info) return null;
          return {
            startTime: res.info.startTime,
            endTime: res.info.endTime,
            progress:
              res.info.progress ??
              (Array.isArray(res.info.report) ? res.info.report.length : 0),
            errors: res.info.errors ?? [],
            infos: res.info.infos ?? [],
            report: res.info.report ?? [],
          } as AutoArchiveLogResult;
        }),
        tap((data) => this.autoArchiveStatus.set(data)),
      )
      .subscribe();

    this.rxStompService
      .watch(`/topic/uvp/archiveStatus/${ConfigService.catalogId}`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((msg) => JSON.parse(msg.body)),
        tap((data) => {
          if (data?.automatic) {
            this.autoArchiveStatus.set(data);
          } else {
            this.status.set(data);
          }
        }),
      )
      .subscribe();
  }

  archiveNow() {
    this.uvpArchiveService.archive(this.dateControl.value).subscribe();
  }

  archiveAutomaticNow() {
    this.uvpArchiveService.runAutomaticArchive().subscribe();
  }

  openDataset(dataset: ArchivedDataset) {
    if (dataset.uuid) {
      this.router.navigate([
        ConfigService.catalogId + "/form",
        { id: dataset.uuid },
      ]);
    }
  }
}
