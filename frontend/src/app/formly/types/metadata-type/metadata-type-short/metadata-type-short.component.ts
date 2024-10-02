import { Component, computed, input, Signal } from "@angular/core";
import { MatChipListbox, MatChipOption } from "@angular/material/chips";
import {
  MetadataOption,
  MetadataOptionItem,
  MetadataOptionItems,
} from "../metadata-type.component";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { AsyncPipe, JsonPipe } from "@angular/common";
import { mergeMap } from "rxjs/operators";
import { Observable, of } from "rxjs";

@Component({
  selector: "ige-metadata-type-short",
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatChipOption,
    MatChipListbox,
    JsonPipe,
    AsyncPipe,
  ],
  templateUrl: "./metadata-type-short.component.html",
  styleUrl: "./metadata-type-short.component.scss",
})
export class MetadataTypeShortComponent {
  options = input.required<MetadataOption[]>();
  value = input.required<any>();

  filteredOptions: Signal<Observable<string>[]> = computed(() => {
    const data = this.value();
    return this.options()
      .flatMap((option) => option.typeOptions)
      .flatMap((typeOption) => {
        const genericItems = typeOption.asyncItems ?? of(typeOption.items);
        return genericItems.pipe(
          mergeMap((item) => {
            return item
              .map((item) => this.filterSelected(data, typeOption, item))
              .filter((item) => item !== null);
          }),
        );
      });
  });

  private filterSelected(
    data: any,
    typeOption: MetadataOptionItems,
    item: MetadataOptionItem,
  ) {
    const primitiveMatch =
      data[typeOption.key] === item.value || data[item.key] === item.value;
    const objectMatch = (data[typeOption.key]?.key ?? "?") === item.value?.key;
    if (primitiveMatch || objectMatch) {
      return item.label;
    }
    return null;
  }
}
