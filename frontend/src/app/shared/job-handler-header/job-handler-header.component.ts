import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ige-job-handler-header",
  templateUrl: "./job-handler-header.component.html",
  styleUrls: ["./job-handler-header.component.scss"],
})
export class JobHandlerHeaderComponent {
  @Input() message;
  @Input() isRunning: boolean;
  @Input() set showMoreForce(value: boolean) {
    this.showMoreInternal = value;
  }

  @Output() showMore = new EventEmitter<boolean>();

  showMoreInternal = false;

  toggleShow() {
    this.showMoreInternal = !this.showMoreInternal;
    this.showMore.next(this.showMoreInternal);
  }
}
