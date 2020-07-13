import {Component, Input, OnInit} from '@angular/core';
import {ConfigService} from '../../services/config/config.service';

@Component({
  selector: 'ige-session-timeout-info',
  templateUrl: './session-timeout-info.component.html',
  styleUrls: ['./session-timeout-info.component.scss']
})
export class SessionTimeoutInfoComponent implements OnInit {

  @Input() timeout: number;

  constructor(private config: ConfigService) {
  }

  ngOnInit(): void {
  }

  refreshSession() {
    this.config.getCurrentUserInfo();
  }
}
