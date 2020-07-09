import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-session-timeout-info',
  templateUrl: './session-timeout-info.component.html',
  styleUrls: ['./session-timeout-info.component.scss']
})
export class SessionTimeoutInfoComponent implements OnInit {

  @Input() timeout: number;

  constructor() {
  }

  ngOnInit(): void {
  }

}
