import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ige-header-navigation',
  templateUrl: './header-navigation.component.html',
  styleUrls: ['./header-navigation.component.scss']
})
export class HeaderNavigationComponent implements OnInit {
  @Input() sections: string[] = [];
  @Output() jumpToSection = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

}
