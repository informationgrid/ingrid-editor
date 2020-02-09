import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  @Input() path: string[];
  @Input() ignoreLast = false;
  @Input() hideLastSeparator = true;

  constructor() {
  }

  ngOnInit() {
    if (this.path) {
      this.path = this.handleIgnoreLast(this.path);
    }
  }

  private handleIgnoreLast(path) {
    if (this.ignoreLast) {
      return path.slice(0, path.length - 1);
    }
    return path;
  }

}
