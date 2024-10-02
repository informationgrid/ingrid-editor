import { Component, input } from "@angular/core";
import { MatChipListbox, MatChipOption } from "@angular/material/chips";
import { MetadataOption } from "../metadata-type.component";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { JsonPipe } from "@angular/common";

@Component({
  selector: "ige-metadata-type-short",
  standalone: true,
  imports: [MatButton, MatIcon, MatChipOption, MatChipListbox, JsonPipe],
  templateUrl: "./metadata-type-short.component.html",
  styleUrl: "./metadata-type-short.component.scss",
})
export class MetadataTypeShortComponent {
  options = input.required<MetadataOption[]>();
  value = input.required<any>();
}
