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
    path?.forEach((item, ind, arr) => {
      this.showBreadcrumbPart[item.id] =
        item.permission.canRead || item.permission.canWrite;
      this.representations[item.id] = this.showCollapsedSymbol(arr, item, ind)
        ? "..."
        : item.title;
    });
    this.breadPath = path;
    this.toShow = this.calculateShortPath(this.breadPath);
  }

  toShow: any[];

  @Input() hideLastSeparator = true;
  @Input() simplePath = false;
  @Input() showRoot = true;
  @Input() rootName = "Daten";
  @Input() emphasize = false;
  @Input() selectable = false;
  @Input() disableRoot = false;

  @Output() select = new EventEmitter<string>();

  showBreadcrumbPart = {};
  showDisabledBreadcrumbPart = {};
  representations = {};

  constructor() {}

  ngOnInit() {}

  onSelect(id: string) {
    if (this.selectable) {
      this.select.next(id);
    }
  }

  calculateShortPath(breadpath: ShortTreeNode[]) {
    let newPath: ShortTreeNode[] = [];

    for (let i = 0; i < breadpath.length; i++) {
      // test if it should be shown
      if (this.showBreadcrumbPart[breadpath[i].id]) {
        newPath.push(breadpath[i]);
      } else {
        if (this.showCollapsedSymbol(breadpath, breadpath[i], i)) {
          // show '...'
          this.representations[breadpath[i].id] = "...";
          newPath.push(breadpath[i]);
        }
        // neither shown nor represented by '...' ? -> ignore and continue with loop
      }
    }
    return newPath;
  }

  calculateLongPath(breadpath: ShortTreeNode[]) {
    let newPath: ShortTreeNode[] = [];

    for (let i = 0; i < breadpath.length; i++) {
      newPath.push(breadpath[i]);
      this.showBreadcrumbPart[breadpath[i].id] = true;
    }
    return newPath;
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

  handleClick(path: ShortTreeNode[], item: ShortTreeNode) {
    if (
      !item.disabled ||
      item.permission.canOnlyWriteSubtree ||
      item.permission.canRead
    ) {
      this.onSelect(item.id);
      return;
    }
    if (this.representations[item.id] === "...") {
      this.unfoldDisabledPath(path);
      this.toShow = this.calculateLongPath(path);
    } else {
      this.collapsePath(path);
      this.toShow = this.calculateShortPath(path);
    }
  }

  unfoldDisabledPath(path: ShortTreeNode[]) {
    path
      .filter((element) => element.disabled && !element.permission.canRead)
      .forEach((elem) => {
        this.showBreadcrumbPart[elem.id] = !this.showBreadcrumbPart[elem.id];
        this.representations[elem.id] = elem.title;
      });
  }

  collapsePath(path: ShortTreeNode[]) {
    path
      .filter((element) => element.disabled && !element.permission.canRead)
      .forEach((elem) => this.togglePathElementsIfNecessary(elem));
  }

  togglePathElementsIfNecessary(item: ShortTreeNode) {
    this.showBreadcrumbPart[item.id] = !this.showBreadcrumbPart[item.id];
    if (this.representations[item.id] === "...") {
      this.representations[item.id] = item.title;
    }
  }

  getBreadcrumbTooltip(item: ShortTreeNode) {
    return item.disabled && item.permission.canRead
      ? "Sie haben keine Schreibberechtigung auf diesen Ordner"
      : item.disabled && this.representations[item.id] !== "..."
      ? "Sie haben keine Leseberechtigung auf diesen Ordner"
      : "";
  }
}
