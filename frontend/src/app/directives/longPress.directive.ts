import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from "@angular/core";

@Directive({
  selector: "[long-press]",
  standalone: true,
})
export class LongPressDirective {
  @Output() longPress = new EventEmitter();
  @Output() shortClick = new EventEmitter();

  private longPressTimeout: any;
  private longPressHandled: boolean;

  constructor(private el: ElementRef) {}

  @HostListener("mousedown", ["$event"])
  @HostListener("touchstart", ["$event"])
  onMouseDown(event: Event) {
    this.longPressHandled = false;
    this.longPressTimeout = setTimeout(() => {
      this.longPress.emit(event);
      this.longPressHandled = true;
    }, 500);
  }

  @HostListener("mouseup")
  @HostListener("touchend")
  onMouseUp(event: Event) {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      if (!this.longPressHandled) this.shortClick.emit(event);
    }
  }
}
