/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { CodelistService, SelectOptionUi } from "./codelist.service";
import { Codelist, CodelistEntry } from "../../store/codelist/codelist.model";

describe("CodelistService", () => {
  // let spectator: SpectatorService<CodelistService>;
  // const createService = createServiceFactory(CodelistService);

  const codelist = <Codelist>{
    id: "1",
    name: "Test Codelist",
    description: "Test Description",
    default: null,
    entries: <CodelistEntry[]>[
      {
        id: "1",
        description: "B",
        fields: { de: "Eins", en: "One", sortkey: "3" },
      },
      {
        id: "2",
        description: "A",
        fields: { de: "Zwei", en: "Two", sortkey: "2" },
      },
      {
        id: "3",
        description: "C",
        fields: { de: "Drei", en: "Three", sortkey: "1" },
      },
    ],
  };

  // beforeEach(() => (spectator = createService()));

  it("should map and sort a codelist by 'label' by default", () => {
    const mapped = CodelistService.mapToSelect(codelist);

    expect(convert(mapped)).toEqual([
      { value: "3", label: "Drei" },
      { value: "1", label: "Eins" },
      { value: "2", label: "Zwei" },
    ]);
  });

  it("should map and not sort a codelist when explicitly defined", () => {
    const mapped = CodelistService.mapToSelect(codelist, "de", "NO_SORT");

    expect(convert(mapped)).toEqual([
      { value: "1", label: "Eins" },
      { value: "2", label: "Zwei" },
      { value: "3", label: "Drei" },
    ]);
  });

  it("should map and sort a codelist by 'label' by explicit call", () => {
    const mapped = CodelistService.mapToSelect(codelist, "de", "label");
    expect(convert(mapped)).toEqual([
      { value: "3", label: "Drei" },
      { value: "1", label: "Eins" },
      { value: "2", label: "Zwei" },
    ]);
  });

  it("should map and sort a codelist by 'value'", () => {
    const mapped = CodelistService.mapToSelect(codelist, "de", "value");
    expect(convert(mapped)).toEqual([
      { value: "1", label: "Eins" },
      { value: "2", label: "Zwei" },
      { value: "3", label: "Drei" },
    ]);
  });

  it("should map and sort a codelist by 'sortkey'", () => {
    const mapped = CodelistService.mapToSelect(codelist, "de", "sortkey");
    expect(convert(mapped)).toEqual([
      { value: "3", label: "Drei" },
      { value: "2", label: "Zwei" },
      { value: "1", label: "Eins" },
    ]);
  });

  it("should map and sort a codelist by 'label' using english label", () => {
    const mapped = CodelistService.mapToSelect(codelist, "en");
    expect(convert(mapped)).toEqual([
      { value: "1", label: "One" },
      { value: "3", label: "Three" },
      { value: "2", label: "Two" },
    ]);
  });

  it("should map and sort a codelist by specific function", () => {
    const sortFn = (a: SelectOptionUi, b: SelectOptionUi) => {
      if (a.value === "2") return -1; // 2 should be first
      if (a.value === "3") return 1; // 3 should be last
      return 0; // other (1) in the middle
    };
    const mapped = CodelistService.mapToSelect(codelist, "de", sortFn);
    expect(convert(mapped)).toEqual([
      { value: "2", label: "Zwei" },
      { value: "1", label: "Eins" },
      { value: "3", label: "Drei" },
    ]);
  });

  function convert(options: SelectOptionUi[]): any {
    return options.map((option) => ({
      value: option.value,
      label: option.label,
    }));
  }
});
