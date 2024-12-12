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
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(codelist);
    expect(convert(mapped)).toEqual([
      { value: "3", label: "Drei", sortkey: "1" },
      { value: "1", label: "Eins", sortkey: "3" },
      { value: "2", label: "Zwei", sortkey: "2" },
    ]);
  });

  it("should map and not sort a codelist when explicitly defined", () => {
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(
      codelist,
      "de",
      "NO_SORT",
    );

    expect(convert(mapped)).toEqual([
      { value: "1", label: "Eins", sortkey: "3" },
      { value: "2", label: "Zwei", sortkey: "2" },
      { value: "3", label: "Drei", sortkey: "1" },
    ]);
  });

  it("should map and sort a codelist by 'label' by explicit call", () => {
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(
      codelist,
      "de",
      "label",
    );
    expect(convert(mapped)).toEqual([
      { value: "3", label: "Drei", sortkey: "1" },
      { value: "1", label: "Eins", sortkey: "3" },
      { value: "2", label: "Zwei", sortkey: "2" },
    ]);
  });

  it("should map and sort a codelist by 'value'", () => {
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(
      codelist,
      "de",
      "value",
    );
    expect(convert(mapped)).toEqual([
      { value: "1", label: "Eins", sortkey: "3" },
      { value: "2", label: "Zwei", sortkey: "2" },
      { value: "3", label: "Drei", sortkey: "1" },
    ]);
  });

  it("should map and sort a codelist by 'sortkey'", () => {
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(
      codelist,
      "de",
      "sortkey",
    );
    expect(convert(mapped)).toEqual([
      { value: "3", label: "Drei", sortkey: "1" },
      { value: "2", label: "Zwei", sortkey: "2" },
      { value: "1", label: "Eins", sortkey: "3" },
    ]);
  });

  it("should map and sort a codelist by 'label' using english label", () => {
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(
      codelist,
      "en",
    );
    expect(convert(mapped)).toEqual([
      { value: "1", label: "One", sortkey: "3" },
      { value: "3", label: "Three", sortkey: "1" },
      { value: "2", label: "Two", sortkey: "2" },
    ]);
  });

  it("should map and sort a codelist by 'description'", () => {
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(
      codelist,
      "de",
      "description",
    );
    expect(convert(mapped)).toEqual([
      { value: "2", label: "Zwei", sortkey: "2" },
      { value: "1", label: "Eins", sortkey: "3" },
      { value: "3", label: "Drei", sortkey: "1" },
    ]);
  });

  it("should map and sort a codelist by specific function", () => {
    const sortFn = (a: CodelistEntry, b: CodelistEntry) => {
      if (a.id === "2") return -1; // 2 should be first
      if (a.id === "3") return 1; // 3 should be last
      return 0; // other (1) in the middle
    };
    const mapped: SelectOptionUi[] = CodelistService.mapToSelect(
      codelist,
      "de",
      sortFn,
    );
    expect(convert(mapped)).toEqual([
      { value: "2", label: "Zwei", sortkey: "2" },
      { value: "1", label: "Eins", sortkey: "3" },
      { value: "3", label: "Drei", sortkey: "1" },
    ]);
  });

  function convert(options: SelectOptionUi[]): any {
    return options.map((option) => ({
      value: option.value,
      label: option.label,
      sortkey: option.sortkey,
    }));
  }
});
