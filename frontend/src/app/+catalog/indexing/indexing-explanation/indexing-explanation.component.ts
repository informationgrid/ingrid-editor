import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatChip, MatChipListbox } from "@angular/material/chips";

@Component({
  selector: "ige-indexing-explanation",
  standalone: true,
  imports: [MatChipListbox, MatChip],
  templateUrl: "./indexing-explanation.component.html",
  styleUrl: "./indexing-explanation.component.scss",
})
export class IndexingExplanationComponent {
  @Output() cronChange = new EventEmitter<string>();
}
