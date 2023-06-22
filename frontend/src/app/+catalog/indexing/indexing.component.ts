import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { IndexService, LogResult } from "./index.service";
import cronstrue from "cronstrue/i18n";
import { UntypedFormControl } from "@angular/forms";
import { ConfigService } from "../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSnackBar } from "@angular/material/snack-bar";
import { map, tap } from "rxjs/operators";
import { merge, Observable } from "rxjs";
import { RxStompService } from "../../rx-stomp.service";
import { copyToClipboardFn } from "../../services/utils";

@UntilDestroy()
@Component({
  selector: "ige-indexing",
  templateUrl: "./indexing.component.html",
  styleUrls: ["./indexing.component.scss"],
})
export class IndexingComponent implements OnInit {
  @ViewChild("indexContent") indexContent: ElementRef<HTMLElement>;

  cronField = new UntypedFormControl();

  hint: string;
  valid = true;
  isActivated: boolean;
  showMore = false;
  indexingIsRunning = false;
  initialized = false;

  liveImportMessage: Observable<LogResult> = merge(
    this.indexService.lastLog$,
    this.rxStompService
      .watch(
        `/topic/indexStatus/${this.configService.$userInfo.value.currentCatalog.id}`
      )
      .pipe(
        map((msg) => JSON.parse(msg.body)),
        tap((data) => (this.indexingIsRunning = !data.endTime))
      )
  );

  copyToClipboardFn = copyToClipboardFn();

  constructor(
    private indexService: IndexService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private rxStompService: RxStompService
  ) {
    this.isActivated = configService.$userInfo.value.useElasticsearch;
  }

  ngOnInit(): void {
    if (!this.isActivated) {
      return;
    }

    this.indexService
      .getIndexConfig()
      .pipe(tap(() => (this.initialized = true)))
      .subscribe((config) => this.cronField.setValue(config.cronPattern));

    this.indexService.fetchLastLog();

    this.cronField.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        let expression = this.translateCronExpression(value);
        this.hint = expression.message;
        this.valid = expression.valid;
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
}
