import { BaseDoctype } from "./base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";

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
    doctype = new DummyDocType();
    initialFieldLength = doctype.fields.length;
    await doctype.init(helpIds);
  });

  it("should add context help info to fields correctly", () => {
    expect(
      doctype.fields[initialFieldLength].props.hasContextHelp
    ).toBeTruthy();
    expect(
      doctype.fields[initialFieldLength + 1].fieldGroup[0].props.hasContextHelp
    ).toBeTruthy();
  });
});
