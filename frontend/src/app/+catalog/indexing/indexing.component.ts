/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { IndexService, LogResult } from "./index.service";
import cronstrue from "cronstrue/i18n";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ConfigService } from "../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSnackBar } from "@angular/material/snack-bar";
import { map, tap } from "rxjs/operators";
import { RxStompService } from "../../rx-stomp.service";
import { copyToClipboardFn } from "../../services/utils";

import { IndexingExplanationComponent } from "./indexing-explanation/indexing-explanation.component";

import { AsyncPipe } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { LogResultComponent } from "./log-result/log-result.component";
import { IndexingFields } from "./indexing-fields";

@UntilDestroy()
@Component({
  selector: "ige-indexing",
  templateUrl: "./indexing.component.html",
  styleUrls: ["./indexing.component.scss"],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IndexingExplanationComponent,
    AsyncPipe,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormlyModule,
    MatButton,
    MatInput,
    LogResultComponent,
  ],
})
export class IndexingComponent implements OnInit {
  @ViewChild("indexContent") indexContent: ElementRef<HTMLElement>;

  cronField = new FormControl<string>("");

  hint: string;
  valid = true;
  isActivated: boolean;
  showMore = false;
  indexingIsRunning = false;
  initialized = false;

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
    this.isActivated = configService.$userInfo.value.useElasticsearch;
  }

  ngOnInit(): void {
    if (!this.isActivated) {
      return;
    }

    this.indexService
      .fetchLastLog()
      .pipe(tap((data) => this.status.set(data)))
      .subscribe();

    this.rxStompService
      .watch(`/topic/indexStatus/${ConfigService.catalogId}`)
      .pipe(
        untilDestroyed(this),
        map((msg) => JSON.parse(msg.body)),
        tap((data) => (this.indexingIsRunning = !data.endTime)),
        tap((data) => this.status.set(data)),
      )
      .subscribe();

    this.indexService
      .getIndexConfig()
      .pipe(tap(() => (this.initialized = true)))
      .subscribe((config) => {
        this.cronField.setValue(config.cronPattern);
        this.exportModel = { "catalog-index-config": config.exports };
      });

    this.cronField.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        let expression = this.translateCronExpression(value);
        this.hint = expression.message;
        this.valid = expression.valid;
      });

    this.configService.getConnectionsConfig().subscribe((config) => {
      this.hasNoConnections.set(config.connections.length === 0);
    });
  }

  index() {
    this.indexService.start().subscribe();
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

    this.copyToClipboardFn(this.indexContent.nativeElement.innerText, {
      successText: "Log in Zwischenablage kopiert",
    });
  }

  deactivateIndexing() {
    this.updatePattern("");
    this.cronField.setValue("");
  }

  cancelIndexing() {
    this.indexingIsRunning = false;
    this.indexService.cancel();
  }

  updateExportConfig() {
    this.indexService
      .setExportConfig(this.exportForm.value["catalog-index-config"])
      .subscribe(() => this.snackBar.open("Konfiguration gespeichert"));
  }
}
