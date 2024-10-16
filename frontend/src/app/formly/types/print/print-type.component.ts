/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Component, inject, OnInit, signal } from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";
import { FieldTypeConfig } from "@ngx-formly/core";
import { BehaviorSubject } from "rxjs";
import { isObject } from "../../../shared/utils";
import { AsyncPipe, DatePipe } from "@angular/common";

import { DocumentService } from "../../../services/document/document.service";
import { CodelistPipe } from "../../../directives/codelist.pipe";

@Component({
  selector: "ige-print-type",
  templateUrl: "./print-type.component.html",
  styleUrls: ["./print-type.component.scss"],
  imports: [DatePipe, AsyncPipe, CodelistPipe],
  standalone: true,
})
export class PrintTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  private documentService = inject(DocumentService);

  addresses = signal<any>([]);

  ngOnInit(): void {
    if (this.field.type === "address-cardPrint") this.getAddressRefs();
  }

  getFromOption(value: any): string {
    if (value === null) return "";
    const options = Array.isArray(this.props.options)
      ? this.props.options
      : (this.props.options as BehaviorSubject<any[]>)?.value;

    if (options != undefined) {
      return options.find((option) => option.value === value?.key)?.label ?? "";
    } else if (isObject(value)) {
      return value.value ?? value.label ?? "";
    } else {
      return "";
    }
  }

  getValueByDefault(value: any) {
    if (typeof value?.replace === "function") {
      return value.replace(/\n/g, "<br>");
    }

    const unit = this.props?.addonRight?.text;
    if (value && unit) return `${value} ${unit}`;

    return value ?? "";
  }

  getAddressRefs() {
    this.addresses.set([]);
    (this.formControl.value ?? []).map((address: any) => {
      this.documentService
        .load(address.ref, true, false, true)
        .subscribe((response) => {
          this.addresses.update((values) => [
            ...values,
            {
              type: address.type,
              data: response.document,
            },
          ]);
        });
    });
  }
}
