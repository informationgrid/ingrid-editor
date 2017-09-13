import {Directive, ElementRef, Input, Renderer} from '@angular/core';

@Directive( {selector: '[scrollTo]'} )
export class ScrollToDirective {

  @Input() scrollTo: boolean;

  constructor(private el: ElementRef, renderer: Renderer) {}

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  protected ngOnChanges() {
    if (this.scrollTo === true) this.el.nativeElement.scrollIntoView();
  }
}
