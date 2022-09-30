import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";

@Component({
  selector: "ige-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
})
export class BreadcrumbComponent implements OnInit {
  breadPath: ShortTreeNode[];
  @Input() set path(path: ShortTreeNode[]) {
    path?.forEach(
      (item) =>
        (this.showBreadcrumbPart[item.id] =
          item.permission.canRead || item.permission.canWrite)
    );
    this.breadPath = path;
  }

  @Input() hideLastSeparator = true;
  @Input() simplePath = false;
  @Input() showRoot = true;
  @Input() rootName = "Daten";
  @Input() emphasize = false;
  @Input() selectable = false;
  @Input() disableRoot = false;

  @Output() select = new EventEmitter<number>();

  showBreadcrumbPart = {};
  showDisabledBreadcrumbPart = {};

  constructor() {}

  ngOnInit() {}

  onSelect(id: number) {
    if (this.selectable) {
      this.select.next(id);
    }
  }

  toggleShowProperty(item: ShortTreeNode) {
    this.showBreadcrumbPart[item.id] = !this.showBreadcrumbPart[item.id];
  }

  showCollapsedSymbol(
    path: ShortTreeNode[],
    item: ShortTreeNode,
    index: number
  ) {
    return (
      path.findIndex(
        (elem) => !this.showBreadcrumbPart[elem.id] && elem.disabled
      ) === index
    );
  }

  showChevron(path: ShortTreeNode[], item: ShortTreeNode, index: number) {
    // chevron is not visible if item is not last one in collapsed part of path
    return !(
      !this.showBreadcrumbPart[item.id] &&
      path.reduce(
        (prev, curr, ind) =>
          !this.showBreadcrumbPart[curr.id] && curr.disabled ? ind : prev,
        -1
      ) !== index
    );
  }

  unfoldDisabledPath(path: ShortTreeNode[]) {
    path
      .filter((element) => element.disabled && !element.permission.canRead)
      .forEach(
        (elem) =>
          (this.showBreadcrumbPart[elem.id] = !this.showBreadcrumbPart[elem.id])
      );
  }

  collapsePath(path: ShortTreeNode[], item: ShortTreeNode) {
    if (
      !item.disabled ||
      item.permission.canOnlyWriteSubtree ||
      item.permission.canRead
    ) {
      this.onSelect(item.id);
      return;
    }
    path.forEach((elem) => this.togglePathElementsIfNecessary(elem));
  }

  togglePathElementsIfNecessary(item: ShortTreeNode) {
    if (
      !item.disabled ||
      item.permission.canRead ||
      item.permission.canOnlyWriteSubtree
    ) {
      return;
    }
    this.showBreadcrumbPart[item.id] = !this.showBreadcrumbPart[item.id];
  }
}
