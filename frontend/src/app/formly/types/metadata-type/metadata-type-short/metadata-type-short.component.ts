import { Component, computed, inject, input, Signal } from "@angular/core";
import { MatChipListbox, MatChipOption } from "@angular/material/chips";
import {
  MetadataOption,
  MetadataOptionItem,
  MetadataOptionItems,
} from "../metadata-type.component";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { AsyncPipe, JsonPipe } from "@angular/common";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../../services/codelist/codelist.service";

interface PropertyItem {
  id: string;
  label: string;
}

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

  private codelistService = inject(CodelistService);

  filteredOptions: Signal<Observable<PropertyItem[]>[]> = computed(() => {
    const data = this.value();
    return this.options()
      .flatMap((option) => option.typeOptions)
      .map((typeOption) => {
        const codelistObs = typeOption.codelistId
          ? this.codelistService
              .observe(typeOption.codelistId)
              .pipe(map((items) => this.mapToMetadataOptionItems(items)))
          : null;
        const genericItems =
          typeOption.asyncItems ?? codelistObs ?? of(typeOption.items);
        return genericItems.pipe(
          map((item) => {
            return (
              item
                ?.map((item) => this.filterSelected(data, typeOption, item))
                ?.filter((item) => item !== null) ?? []
            );
          }),
        );
      });
  });

  private mapToMetadataOptionItems(items: SelectOptionUi[]) {
    return items.map((item) => {
      return <MetadataOptionItem>{
        label: item.label,
        value: { key: item.value },
      };
    });
  }

  private filterSelected(
    data: any,
    typeOption: MetadataOptionItems,
    item: MetadataOptionItem,
  ): PropertyItem {
    const primitiveMatch =
      data[typeOption.key] === item.value || data[item.key] === item.value;
    const objectMatch = (data[typeOption.key]?.key ?? "?") === item.value?.key;
    if (primitiveMatch || objectMatch) {
      const id =
        item.key ?? typeOption.key + "_" + (item.value.key ?? item.value);
      return { id: id, label: item.label };
    }
    return null;
  }
}
