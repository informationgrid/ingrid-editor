import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { PageTemplateComponent } from "./page-template.component";

describe("PageTemplateComponent", () => {
  let spectator: Spectator<PageTemplateComponent>;
  const createComponent = createComponentFactory(PageTemplateComponent);

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
