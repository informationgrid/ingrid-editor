import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[igeFocus]'
})
export class FocusDirective {

  @Input() igeFocus: boolean;

  constructor(private host: ElementRef) {
  }

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  ngAfterViewInit(): void {
    // setTimeout(() => this.el.nativeElement.focus());
    this.host.nativeElement.focus();
  }
}
