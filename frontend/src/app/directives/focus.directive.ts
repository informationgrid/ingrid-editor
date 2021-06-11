import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[igeFocus]",
})
export class FocusDirective {
  @Input() igeFocus: boolean;

  constructor(private host: ElementRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.host.nativeElement.focus());
  }
}
