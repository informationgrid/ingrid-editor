/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { CatalogCodelistsComponent } from "./catalog-codelists.component";
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { CodelistService } from "../../services/codelist/codelist.service";
import { CodelistQuery } from "../../store/codelist/codelist.query";
import { MatSelectHarness } from "@angular/material/select/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Codelist } from "../../store/codelist/codelist.model";
import { CodelistPresenterComponent } from "../../shared/codelist-presenter/codelist-presenter.component";
import { MatSlideToggleHarness } from "@angular/material/slide-toggle/testing";
import { HarnessLoader } from "@angular/cdk/testing";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { TestBed } from "@angular/core/testing";
import { CodelistStore } from "../../store/codelist/codelist.store";

describe("CatalogCodelistsComponent", () => {
  let spectator: Spectator<CatalogCodelistsComponent>;
  let loader: HarnessLoader;

  let initCodelists: Codelist[] = [
    {
      id: "10",
      name: "Cat Zehn",
      entries: [{ id: "a1", fields: { de: "Cat Eins A" }, description: "" }],
      default: null,
      isCatalog: true,
    },
    {
      id: "1",
      name: "One",
      entries: [
        { id: "r1", fields: { de: "Eins A" }, description: "" },
        { id: "r2", fields: { de: "Zwei A" }, description: "" },
      ],
      default: null,
    },
    { id: "2", name: "Two", entries: [], default: null },
  ];

  const createHost = createComponentFactory({
    component: CatalogCodelistsComponent,
    imports: [CodelistPresenterComponent, HttpClientTestingModule],
    providers: [mockProvider(CodelistService)],
    detectChanges: false,
  });

  beforeEach(async () => {
    spectator = createHost({});
    let codelistStore = TestBed.inject(CodelistStore);
    codelistStore.set(initCodelists);

    spectator.detectChanges();
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    await spectator.fixture.whenStable();
  });

  it("should create with success", () => {
    expect(spectator).toBeTruthy();
  });

  it("should show initially the first codelist", async () => {
    const select = await loader.getHarness(MatSelectHarness);
    expect(await select.getValueText()).toBe("Cat Zehn (10)");
    const items = spectator.queryAll("mat-expansion-panel");
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain("Cat Eins A");
  });

  it("should show both kinds of codelists (catalog and from repo)", async () => {
    const select = await loader.getHarness(MatSelectHarness);
    const codelistSwitch = await loader.getHarness(MatSlideToggleHarness);
    await codelistSwitch.check();
    await select.open();
    const options = await select.getOptions();
    expect(options.length).toBe(4);
  });

  it("should show only catalog codelist", async () => {
    const select = await loader.getHarness(MatSelectHarness);
    const codelistSwitch = await loader.getHarness(MatSlideToggleHarness);
    await codelistSwitch.uncheck();
    await select.open();
    const options = await select.getOptions();
    expect(options.length).toBe(2);
  });

  it("should show entries for a repo codelist with no edit option", async () => {
    const select = await loader.getHarness(MatSelectHarness);
    const codelistSwitch = await loader.getHarness(MatSlideToggleHarness);
    await codelistSwitch.check();
    await select.open();
    await select.clickOptions({ text: "One (1)" });
    const items = spectator.queryAll("mat-expansion-panel");
    expect(items.length).toBe(2);

    let menuItems = await openMenuOfEntry(0);
    expect(menuItems.length).toBe(1);
    expect(await menuItems[0].getText()).toBe("Als Favorit setzen");
  });

  it("should show catalog codelists with edit option", async () => {
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    await select.clickOptions({ text: "Cat Zehn (10)" });
    const items = spectator.queryAll("mat-expansion-panel");
    expect(items.length).toBe(1);

    let menuItems = await openMenuOfEntry(0);
    expect(menuItems.length).toBe(4);
    await menuItems[1].click();

    spectator.detectChanges();
    let dialogTitle = spectator.query(".dialog-title-wrapper", { root: true });
    expect(dialogTitle.textContent).toContain("Eintrag bearbeiten");
  });

  it("should set a favorite", async () => {
    spectator.detectChanges();
    expect(spectator.query("[main-content]").textContent).not.toContain(
      "Favoriten",
    );
    const menuItems = await openMenuOfEntry(0);
    await menuItems[0].click();
    expect(spectator.query("[main-content]").textContent).toContain(
      "Favoriten",
    );
    const listItems = spectator.queryAll(".list-item");
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain("Cat Eins A");
  });

  it("should remove a favorite by menu item", async () => {
    addFavorite();
    spectator.detectChanges();

    expect(spectator.query("[main-content]").textContent).toContain(
      "Favoriten",
    );
    const menuItems = await openMenuOfEntry(0);
    expect(await menuItems[0].getText()).toBe("Favorit entfernen");
    await menuItems[0].click();

    expect(spectator.query("[main-content]").textContent).not.toContain(
      "Favoriten",
    );
  });

  async function openMenuOfEntry(index: number) {
    const menuButton = spectator.queryAll(
      "mat-expansion-panel [data-cy=btn-menu]",
    )[index];
    spectator.click(menuButton);

    const menu = await loader.getHarness(MatMenuHarness);
    return await menu.getItems();
  }

  function addFavorite() {
    spectator.component.favorites.push(initCodelists[0].entries[0]);
    spectator.component.favoriteIds.push(initCodelists[0].entries[0].id);
  }
});
