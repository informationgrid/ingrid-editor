/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Directive, ElementRef } from "@angular/core";

// todo: add animate
// todo: add init and on change
@Directive({
  selector: "[collapse]",
  inputs: ["collapse"],
  host: {
    "[class.in]": "isExpanded",
    "[class.collapse]": "isCollapse",
    "[class.collapsing]": "isCollapsing",
    "[attr.aria-expanded]": "isExpanded",
    "[attr.aria-hidden]": "isCollapsed",
    "[style.height]": "height",
  },
})
export class Collapse {
  public test: any = "wtf";
  // style
  private height: string;
  // classes
  // shown
  private isExpanded = true;
  // hidden
  private isCollapsed = false;
  // stale state
  private isCollapse = true;
  // animation state
  private isCollapsing = false;

  constructor(private el: ElementRef) {}

  private get collapse(): boolean {
    return this.isExpanded;
  }

  private set collapse(value: boolean) {
    this.isExpanded = value;
    this.toggle();
  }

  toggle() {
    if (this.isExpanded) {
      this.hide();
    } else {
      this.show();
    }
  }

  hide() {
    this.isCollapse = false;
    this.isCollapsing = true;

    this.isExpanded = false;
    this.isCollapsed = true;
    setTimeout(() => {
      this.height = "0";
      this.isCollapse = true;
      this.isCollapsing = false;
    }, 4);
  }

  show() {
    this.isCollapse = false;
    this.isCollapsing = true;

    this.isExpanded = true;
    this.isCollapsed = false;
    setTimeout(() => {
      this.height = "auto";

      this.isCollapse = true;
      this.isCollapsing = false;
    }, 4);
  }
}
