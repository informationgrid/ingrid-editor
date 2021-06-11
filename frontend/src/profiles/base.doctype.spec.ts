import { BaseDoctype } from "./base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";

class DummyDocType extends BaseDoctype {
  documentFields() {
    return <FormlyFieldConfig[]>[
      {
        key: "root",
        type: "input",
        templateOptions: {},
      },
      {
        wrappers: ["section"],
        fieldGroup: [
          {
            key: "sectionSimple",
            type: "input",
            templateOptions: {},
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

  beforeEach(() => {
    doctype = new DummyDocType(null, null);
    initialFieldLength = doctype.fields.length;
    doctype.init(helpIds);
  });

  it("should add context help info to fields correctly", () => {
    console.log("context help");
    expect(
      doctype.fields[initialFieldLength].templateOptions.hasContextHelp
    ).toBeTruthy();
    expect(
      doctype.fields[initialFieldLength + 1].fieldGroup[0].templateOptions
        .hasContextHelp
    ).toBeTruthy();
  });
});
