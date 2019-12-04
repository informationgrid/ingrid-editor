import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-header-navigation',
  templateUrl: './header-navigation.component.html',
  styleUrls: ['./header-navigation.component.scss']
})
export class HeaderNavigationComponent implements OnInit {
  @Input() sections: string[] = [];

  constructor() { }

  ngOnInit() {
  }

}
