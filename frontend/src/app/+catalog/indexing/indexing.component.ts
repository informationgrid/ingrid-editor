/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from "@angular/core";
import { IndexService, LogResult } from "./index.service";
import cronstrue from "cronstrue/i18n";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ConfigService } from "../../services/config/config.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { map, tap } from "rxjs/operators";
import { RxStompService } from "../../rx-stomp.service";
import { copyToClipboardFn } from "../../services/utils";

import { IndexingExplanationComponent } from "./indexing-explanation/indexing-explanation.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { LogResultComponent } from "./log-result/log-result.component";
import { IndexingFields } from "./indexing-fields";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { JobHandlerHeaderComponent } from "../../shared/job-handler-header/job-handler-header.component";
import { MatomoTrackClickDirective } from "ngx-matomo-client";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "ige-indexing",
  templateUrl: "./indexing.component.html",
  styleUrls: ["./indexing.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IndexingExplanationComponent,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButton,
    MatInput,
    LogResultComponent,
    PageTemplateComponent,
    JobHandlerHeaderComponent,
    MatomoTrackClickDirective,
    FormlyForm,
  ],
})
export class IndexingComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  readonly indexContent = viewChild<ElementRef<HTMLElement>>("indexContent");

  cronField = new FormControl<string>("");

  hint = signal<string>("");
  valid = signal<boolean>(true);
  isActivated = signal<boolean>(false);
  showMore = signal<boolean>(false);
  indexingIsRunning = signal<boolean>(false);
  initialized = signal<boolean>(false);

  exportForm = new FormGroup({});
  exportModel: any = {};

  status = signal<LogResult>(null);
  hasNoConnections = signal<boolean>(false);

  private copyToClipboardFn = copyToClipboardFn();
  fields: FormlyFieldConfig[] = inject(IndexingFields).fields;

  constructor(
    private indexService: IndexService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private rxStompService: RxStompService,
  ) {
    this.isActivated.set(configService.$userInfo.value.useElasticsearch);
  }

  ngOnInit(): void {
    if (!this.isActivated()) {
      return;
    }

    this.indexService
      .fetchLastLog()
      .pipe(tap((data) => this.status.set(data)))
      .subscribe();

    this.rxStompService
      .watch(`/topic/indexStatus/${ConfigService.catalogId}`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((msg) => JSON.parse(msg.body)),
        tap((data) => this.indexingIsRunning.set(!data.endTime)),
        tap((data) => this.status.set(data)),
      )
      .subscribe();

    this.indexService
      .getIndexConfig()
      .pipe(tap(() => this.initialized.set(true)))
      .subscribe((config) => {
        this.cronField.setValue(config.cronPattern);
        this.exportModel = { "catalog-index-config": config.exports };
      });

    this.cronField.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        let expression = this.translateCronExpression(value);
        this.hint.set(expression.message);
        this.valid.set(expression.valid);
      });

    this.configService.getConnectionsConfig().subscribe((config) => {
      this.hasNoConnections.set(config.connections.length === 0);
    });
  }

  index() {
    this.indexService
      .start()
      .pipe(tap(() => this.indexingIsRunning.set(true)))
      .subscribe();
  }

  updatePattern(value: string) {
    this.indexService.setCronPattern(value).subscribe();
    if (value) this.snackBar.open("Cron-Ausdruck aktualisiert");
  }

  translateCronExpression(value: string): { valid: boolean; message: string } {
    if (!value || value.trim().split(" ").length !== 6) {
      return {
        valid: true,
        message:
          "Ein gültiger Cron Ausdruck sieht folgendermaßen aus: 0 */10 * * * *",
      };
    }

    try {
      return {
        valid: true,
        message: cronstrue.toString(value, { locale: "de" }),
      };
    } catch (e) {
      return {
        valid: false,
        message: "Ungültiger Ausdruck",
      };
    }
  }

  copyContent(event: MouseEvent) {
    event.preventDefault();

    this.copyToClipboardFn(this.indexContent().nativeElement.innerText, {
      successText: "Log in Zwischenablage kopiert",
    });
  }

  deactivateIndexing() {
    this.updatePattern("");
    this.cronField.setValue("");
  }

  cancelIndexing() {
    this.indexingIsRunning.set(false);
    this.indexService.cancel();
  }

  updateExportConfig() {
    this.indexService
      .setExportConfig(this.exportForm.value["catalog-index-config"])
      .subscribe(() => this.snackBar.open("Konfiguration gespeichert"));
  }
}
