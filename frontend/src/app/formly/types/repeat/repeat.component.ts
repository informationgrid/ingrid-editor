import { Component, OnInit } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

@Component({
  selector: "ige-repeat",
  templateUrl: "./repeat.component.html",
  styleUrls: ["./repeat.component.scss"],
})
export class RepeatComponent extends FieldArrayType implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {}

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }
}
