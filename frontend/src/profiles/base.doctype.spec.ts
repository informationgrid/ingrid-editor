/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { BaseDoctype } from "./base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { getTranslocoModule } from "../app/transloco-testing.module";

@Injectable({
  providedIn: "root",
})
class DummyDocType extends BaseDoctype {
  documentFields() {
    return <FormlyFieldConfig[]>[
      {
        key: "root",
        type: "input",
        props: {},
      },
      {
        wrappers: ["section"],
        fieldGroup: [
          {
            key: "sectionSimple",
            type: "input",
            props: {},
          },
        ],
      },
    ];
  }
}

describe("Document Type", () => {
  const helpIds = ["root", "sectionSimple"];
  let initialFieldLength = 0;
  let doctype;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        getTranslocoModule(),
      ],
      providers: [DummyDocType],
    });
    doctype = TestBed.inject(DummyDocType);
    initialFieldLength = doctype.fields.length;
    await doctype.init(helpIds);
  });

  it("should add context help info to fields correctly", () => {
    expect(
      doctype.fields[initialFieldLength].props.hasContextHelp,
    ).toBeTruthy();
    expect(
      doctype.fields[initialFieldLength + 1].fieldGroup[0].props.hasContextHelp,
    ).toBeTruthy();
  });
});
