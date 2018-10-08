import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive( {selector: '[focus]'} )
export class FocusDirective implements OnChanges {

  @Input() focus: boolean;

  constructor(private el: ElementRef) {}

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  public ngOnChanges() {
    if (this.focus === true) {
      this.el.nativeElement.focus();
    }
  }
}
