import { FormDashboardComponent } from "./form-dashboard.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { DocumentService } from "../../services/document/document.service";
import { FormToolbarService } from "../form-shared/toolbar/form-toolbar.service";
import { RouterTestingModule } from "@angular/router/testing";

describe("FormDashboardComponent", () => {
  let spectator: Spectator<FormDashboardComponent>;
  const createComponent = createComponentFactory({
    component: FormDashboardComponent,
    imports: [RouterTestingModule.withRoutes([])],
    mocks: [DocumentService, FormToolbarService],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  xit("should create", () => {
    expect(spectator.component).toBeTruthy();
  });
});
