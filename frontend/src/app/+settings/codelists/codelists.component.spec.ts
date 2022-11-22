import { CodelistsComponent } from "./codelists.component";
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { CodelistService } from "../../services/codelist/codelist.service";
import { CodelistPresenterModule } from "../../shared/codelist-presenter/codelist-presenter.module";
import { FilterSelectModule } from "../../shared/filter-select/filter-select.module";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";

describe("CodelistsComponent", () => {
  let spectator: Spectator<CodelistsComponent>;
  const createHost = createComponentFactory({
    component: CodelistsComponent,
    providers: [mockProvider(CodelistService)],
    imports: [CodelistPresenterModule, FilterSelectModule, PageTemplateModule],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
