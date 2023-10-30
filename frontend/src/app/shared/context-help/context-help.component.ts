import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";

@Component({
  selector: "ige-context-help",
  templateUrl: "./context-help.component.html",
  styleUrls: ["./context-help.component.scss"],
})
export class ContextHelpComponent implements OnInit, OnDestroy {
  @ViewChild("contextHelpContainer") container: ElementRef;

  title: string;
  description$: Observable<String> = this.data.description$;
  notResized = true;
  private timer: NodeJS.Timeout;
  private initialDimension = {
    width: "",
    height: "",
  };

  constructor(
    public dialogRef: MatDialogRef<ContextHelpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.title = this.data.title ? this.data.title : "Kein Titel";
    this.timer = setInterval(() => this.checkSize(), 500);
  }

  checkSize() {
    let newHeight =
      this.container.nativeElement.parentElement.parentElement.style.height;
    let newWidth =
      this.container.nativeElement.parentElement.parentElement.style.width;
    if (
      this.initialDimension.width !== newWidth ||
      this.initialDimension.height !== newHeight
    ) {
      clearInterval(this.timer);
      this.notResized = false;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
