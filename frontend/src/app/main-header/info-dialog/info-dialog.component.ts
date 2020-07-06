import { Component, OnInit } from '@angular/core';
import {ConfigService, Version} from '../../services/config/config.service';

@Component({
  selector: 'ige-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {
  version: Version;

  constructor(private config: ConfigService) { }

  ngOnInit() {
    this.version = this.config.$userInfo.getValue().version;
  }

}
