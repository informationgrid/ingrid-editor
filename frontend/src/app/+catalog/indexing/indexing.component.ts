import { Component, OnInit } from '@angular/core';
import {IndexService} from './index.service';

@Component({
  selector: 'ige-indexing',
  templateUrl: './indexing.component.html',
  styleUrls: ['./indexing.component.scss']
})
export class IndexingComponent implements OnInit {

  constructor(private indexService: IndexService) { }

  ngOnInit(): void {
  }

  index() {
    this.indexService.start().subscribe()
  }

  updatePattern(value: string) {
    this.indexService.setCronPattern(value).subscribe();
  }
}
