import {Component, OnDestroy, OnInit} from '@angular/core';
import {MessageService} from '../../../services/message.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {animate, state, style, transition, trigger} from '@angular/animations';

export interface FormMessageType {
  severity: 'info' | 'error';
  message: string;
  duration?: number;
}

@Component({
  selector: 'ige-form-message',
  templateUrl: './form-message.component.html',
  styleUrls: ['./form-message.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0}),
        animate('300ms ease-in', style({ height: 48, opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: 48, opacity: 1 }),
        animate('300ms ease-out', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class FormMessageComponent implements OnInit, OnDestroy {

  type: FormMessageType;

  private timer;

  private defaultDuration = 3000;

  constructor(private messageService: MessageService) { }

  ngOnInit() {
    this.messageService.message$
      .pipe(untilDestroyed(this))
      .subscribe(type => this.handleMessage(type));
  }

  ngOnDestroy(): void {
  }

  private handleMessage(type: FormMessageType) {
    clearTimeout(this.timer);

    this.type = type;

    if (type.severity === 'info') {
      this.timer = setTimeout(() => this.type = null, type.duration || this.defaultDuration);
    }
  }

  getIconClass(severity: 'info' | 'error') {
    switch (severity) {
      case 'info': return 'done';
      case 'error': return 'warning';
      default: throw new Error('Unknown severity: ' + severity);
    }
  }
}
