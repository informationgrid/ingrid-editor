import {Component, OnInit} from '@angular/core';
import {IndexService} from './index.service';
import cronstrue from 'cronstrue/i18n';
import {FormControl} from '@angular/forms';
import {ConfigService} from '../../services/config/config.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {RxStompService} from '@stomp/ng2-stompjs';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';

@UntilDestroy()
@Component({
  selector: 'ige-indexing',
  templateUrl: './indexing.component.html',
  styleUrls: ['./indexing.component.scss']
})
export class IndexingComponent implements OnInit {

  cronField = new FormControl();

  hint: string;
  valid = true;
  isActivated: boolean;
  showMore = false;

  lastLog = this.indexService.lastLog$;
  private receivedMessages: any[] = [];

  constructor(private indexService: IndexService,
              private configService: ConfigService,
              private clipboard: Clipboard,
              private snackBar: MatSnackBar,
              private rxStompService: RxStompService) {
    this.isActivated = configService.$userInfo.value.useElasticsearch;
  }

  ngOnInit(): void {
    if (!this.isActivated) {
      return;
    }

    this.rxStompService.watch('/topic/indexStatus')
      .pipe(untilDestroyed(this))
      .subscribe((message: any) => {
        this.receivedMessages.push(message.body);
        console.log(message.body);
      });

    this.indexService.getCronPattern()
      .subscribe(config => this.cronField.setValue(config.cronPattern));

    this.indexService.fetchLastLog();

    this.cronField.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(value => {
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
  }

  translateCronExpression(value: string): { valid: boolean, message: string } {
    if (!value || value.trim().split(' ').length !== 6) {
      return {
        valid: true,
        message: 'Ein gültige Cron Ausdruck sieht folgendermaßen aus: 0 */10 * * * *'
      };
    }

    try {
      return {
        valid: true,
        message: cronstrue.toString(value, {locale: 'de'})
      };
    } catch (e) {
      return {
        valid: false,
        message: 'Ungültiger Ausdruck'
      };
    }
  }

  copyContent(event: MouseEvent) {
    event.preventDefault();

    this.clipboard.copy(this.lastLog.value.log.join('\n'));
    this.snackBar.open('Log in Zwischenablage kopiert');
  }
}
