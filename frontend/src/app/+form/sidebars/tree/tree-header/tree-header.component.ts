import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ige-tree-header',
  templateUrl: './tree-header.component.html',
  styleUrls: ['./tree-header.component.scss']
})
export class TreeHeaderComponent implements OnInit {
  @Input() showReloadButton = true;

  @Output() reload = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  reloadTree() {
    this.reload.emit();
  }
}
