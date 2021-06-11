import { FormLabelComponent } from "./form-label.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { ContextHelpService } from "../../../services/context-help/context-help.service";

describe("FormLabelComponent", () => {
  let spectator: Spectator<FormLabelComponent>;
  const createHost = createComponentFactory({
    component: FormLabelComponent,
    mocks: [ContextHelpService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
