import { RepeatComponent } from "./repeat.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { SharedModule } from "../../../shared/shared.module";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";

describe("RepeatComponent", () => {
  let spectator: Spectator<RepeatComponent>;
  const createHost = createComponentFactory({
    component: RepeatComponent,
    imports: [SharedModule],
    declarations: [AddButtonComponent],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
    // @ts-ignore
    spectator.component.field = {};
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
