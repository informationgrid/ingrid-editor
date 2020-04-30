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

  scrollToSection(index: number) {
    const element = document
      .querySelectorAll('ige-section-wrapper')
      .item(index)
      .scrollIntoView({behavior: 'smooth', block: 'end'});

    // TODO: calculate correct scroll position, so we won't hide behind the header
    // const position = element.getBoundingClientRect().top + window.pageYOffset;
    // element.parentElement.parentElement.parentElement.parentElement.scrollTo({top: position, behavior: 'smooth'});
  }
}
