/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, computed, inject, input, Signal } from "@angular/core";
import { MatChipListbox, MatChipOption } from "@angular/material/chips";
import {
  MetadataOption,
  MetadataOptionItem,
  MetadataOptionItems,
} from "../metadata-type.component";
import { CodelistStore } from "../../../../store/codelist/codelist.store";

interface PropertyItem {
  id: string;
  label: string;
  completeLabel?: string;
}

@Component({
  selector: "ige-metadata-type-short",
  imports: [MatChipOption, MatChipListbox],
  templateUrl: "./metadata-type-short.component.html",
  styleUrl: "./metadata-type-short.component.scss",
})
export class MetadataTypeShortComponent {
  options = input.required<MetadataOption[]>();
  value = input.required<any>();

  private codelistStore = inject(CodelistStore);

  filteredOptions: Signal<PropertyItem[]> = computed(() => {
    const data = this.value();
    const typeOptions = this.options().flatMap((option) => option.typeOptions);

    // Process all type options and collect the results
    const result: PropertyItem[] = [];
    for (const typeOption of typeOptions) {
      // Get the items from codelist or direct items
      let items: MetadataOptionItem[] = [];
      if (typeOption.codelistId) {
        // For codelist items, get them from the store
        try {
          const codelist =
            this.codelistStore.entityMap()[typeOption.codelistId];
          if (codelist) {
            // Map codelist entries to MetadataOptionItems
            items = codelist.entries.map((entry) => ({
              label: entry.fields?.de || entry.id,
              value: { key: entry.id },
            }));
          }
        } catch (e) {
          console.error(`Error getting codelist ${typeOption.codelistId}:`, e);
        }
      } else if (typeOption.items) {
        items = typeOption.items;
      }

      // Filter and map the items
      const filteredItems =
        items
          ?.map((item) => this.filterSelected(data, typeOption, item))
          ?.filter((item) => item !== null) ?? [];

      // Add to result
      result.push(...filteredItems);
    }

    return result;
  });

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
      return { id: id, label: item.completeLabel ?? item.label };
    }
    return null;
  }
}
