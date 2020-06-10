import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';

@Directive({selector: '[igeFocus]'})
export class FocusDirective implements AfterViewInit {

  @Input() igeFocus: boolean;

  constructor(private el: ElementRef<HTMLInputElement>) {
  }

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  ngAfterViewInit(): void {
    setTimeout(() => this.el.nativeElement.focus());
  }
}
