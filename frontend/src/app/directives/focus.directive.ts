import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive( {selector: '[igeFocus]'} )
export class FocusDirective implements OnChanges {

  @Input() igeFocus: boolean;

  constructor(private el: ElementRef) {}

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  public ngOnChanges() {
    if (this.igeFocus === true) {
        this.el.nativeElement.focus()
    }
  }
}
