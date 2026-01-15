import { Component, computed, input, signal } from "@angular/core";
import { KeyValuePipe, NgClass } from "@angular/common";

@Component({
  selector: "ige-json-node",
  imports: [KeyValuePipe, NgClass],
  templateUrl: "./json-node.component.html",
  styleUrl: "./json-node.component.scss",
})
export class JsonNodeComponent {
  key = input<string | null>(null);
  value = input.required<any>();

  isExpanded = signal(true);

  isObject = computed(() => {
    const val = this.value();
    return val !== null && typeof val === "object";
  });

  isArray = computed(() => Array.isArray(this.value()));

  valueType = computed(() => typeof this.value());

  toggle() {
    this.isExpanded.update((v) => !v);
  }
}
