import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "ige-header-navigation",
  templateUrl: "./header-navigation.component.html",
  styleUrls: ["./header-navigation.component.scss"],
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
