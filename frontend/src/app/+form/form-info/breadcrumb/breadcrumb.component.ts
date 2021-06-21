import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";

@Component({
  selector: "ige-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
})
export class BreadcrumbComponent implements OnInit {
  @Input() path: ShortTreeNode[];
  @Input() hideLastSeparator = true;
  @Input() showRoot = true;
  @Input() rootName = "Daten";
  @Input() emphasize = false;
  @Input() selectable = false;
  @Input() disableRoot = false;

  @Output() select = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  onSelect(id: string) {
    if (this.selectable) {
      this.select.next(id);
    }
  }
}
