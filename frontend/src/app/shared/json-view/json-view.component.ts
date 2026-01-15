import { Component, input, signal } from "@angular/core";
import { JsonNodeComponent } from "./json-node/json-node.component";
import { JsonPipe } from "@angular/common";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "ige-json-view",
  imports: [JsonNodeComponent, JsonPipe, MatButton],
  templateUrl: "./json-view.component.html",
  styleUrl: "./json-view.component.scss",
})
export class JsonViewComponent {
  data = input.required<any>();

  isTreeView = signal(true);

  toggleView() {
    this.isTreeView.update((v) => !v);
  }
}
