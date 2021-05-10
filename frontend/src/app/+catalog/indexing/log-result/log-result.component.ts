import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LogResult} from '../index.service';

@Component({
  selector: 'ige-log-result',
  templateUrl: './log-result.component.html',
  styleUrls: ['./log-result.component.scss']
})
export class LogResultComponent implements OnInit {

    @Input() data: Observable<LogResult>;

    constructor() { }

  ngOnInit(): void {
  }

}
