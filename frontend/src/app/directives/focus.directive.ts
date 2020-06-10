import {AfterContentChecked, Directive, ElementRef, Input} from '@angular/core';

@Directive({selector: '[igeFocus]'})
export class FocusDirective implements AfterContentChecked {

  @Input() igeFocus: boolean;

  constructor(private el: ElementRef<HTMLInputElement>) {
  }

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  ngAfterContentChecked(): void {
    this.el.nativeElement.focus()
  }
}
