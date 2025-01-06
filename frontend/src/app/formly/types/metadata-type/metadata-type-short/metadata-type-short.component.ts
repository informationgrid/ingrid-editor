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
