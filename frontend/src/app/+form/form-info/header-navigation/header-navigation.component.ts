/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Component, Input, OnInit } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { NgIf } from "@angular/common";

@Component({
  selector: "ige-header-navigation",
  templateUrl: "./header-navigation.component.html",
  styleUrls: ["./header-navigation.component.scss"],
  standalone: true,
  imports: [MatButton, NgIf],
})
export class HeaderNavigationComponent implements OnInit {
  @Input() sections: string[] = [];

  constructor() {}

  ngOnInit() {}

  scrollToSection(index: number) {
    const element = document
      .querySelectorAll("ige-section-wrapper")
      .item(index);
    // calculate offset
    const toolbar = document.querySelectorAll("form-toolbar")[0];
    const formNav = document.querySelectorAll("ige-header-navigation")[0];
    const yOffset =
      toolbar.getBoundingClientRect().top +
      toolbar.getBoundingClientRect().height +
      formNav.getBoundingClientRect().height;
    // calculate scroll position (account for form's current scroll position)
    const y =
      index === 0
        ? 0
        : element.getBoundingClientRect().top +
          document.getElementById("form").scrollTop -
          yOffset -
          10;
    // scroll to position
    document.getElementById("form").scrollTo({ top: y, behavior: "smooth" });
    // set autofocus to the section header
    const focusTarget = this.getFocusable(element);
    focusTarget?.focus({ preventScroll: true });
  }

  private getFocusable(el: Element): HTMLElement {
    const selectors =
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    return el.querySelectorAll(selectors)?.item(0) as HTMLElement;
  }
}
