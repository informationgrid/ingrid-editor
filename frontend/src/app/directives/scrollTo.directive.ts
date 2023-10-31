import { Directive, ElementRef, Input, Renderer2 } from "@angular/core";

@Directive({ selector: "[scrollTo]" })
export class ScrollToDirective {
  @Input() scrollTo: boolean;

  constructor(
    private el: ElementRef,
    renderer: Renderer2,
  ) {}

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  protected ngOnChanges() {
    if (this.scrollTo === true) {
      this.el.nativeElement.scrollIntoView();
    }
  }
}
