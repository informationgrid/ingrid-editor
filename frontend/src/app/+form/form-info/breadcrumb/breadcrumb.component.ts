/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import {
  Component,
  computed,
  forwardRef,
  input,
  OnInit,
  output,
  Pipe,
  PipeTransform,
  Signal,
} from "@angular/core";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "ige-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
  imports: [MatTooltip, MatIcon, forwardRef(() => BreadCrumbTooltipPipe)],
})
export class BreadcrumbComponent implements OnInit {
  path = input<ShortTreeNode[]>([]);
  simplePath = input<boolean>(false);
  rootName = input<string>("Daten");
  emphasize = input<boolean>(false);
  selectable = input<boolean>(false);
  disableRoot = input<boolean>(false);

  select = output<number>();

  shortPath: Signal<ShortTreeNode[]> = computed(() => {
    return this.calculateShortPath(this.path());
  });
  collapsed = true;

  static readonly COLLAPSED_SYMBOL_NODE = new ShortTreeNode(
    -1,
    "...",
    undefined,
    true,
  );

  constructor() {}

  ngOnInit() {}

  onSelect(id: number) {
    if (this.selectable()) {
      this.select.emit(id);
    }
  }

  calculateShortPath(breadpath: ShortTreeNode[]) {
    if (!breadpath) return [];

    const shortPath = breadpath.filter(
      (node) => node.permission.canRead || node.permission.canWrite,
    );
    const collapsedItemsExist = shortPath.length < breadpath.length;

    if (collapsedItemsExist) {
      // add collapsed symbolNode to front
      shortPath.unshift(BreadcrumbComponent.COLLAPSED_SYMBOL_NODE);
    }
    return shortPath;
  }

  handleClick(item: ShortTreeNode) {
    if (item.isSelectable()) {
      this.onSelect(item.id);
    } else {
      // collapse on COLLAPSED_SYMBOL click, expand on other non-readable items
      this.collapsed = item.id !== BreadcrumbComponent.COLLAPSED_SYMBOL_NODE.id;
    }
  }
}

@Pipe({
  name: "breadCrumbTooltip",
  standalone: true,
})
export class BreadCrumbTooltipPipe implements PipeTransform {
  transform(value: ShortTreeNode, args?: any): any {
    if (value) {
      return value.disabled && value.permission?.canRead
        ? "Sie haben keine Schreibberechtigung auf diesen Ordner"
        : value.disabled &&
            value.id !== BreadcrumbComponent.COLLAPSED_SYMBOL_NODE.id
          ? "Sie haben keine Leseberechtigung auf diesen Ordner"
          : "";
    }
    return value;
  }
}
