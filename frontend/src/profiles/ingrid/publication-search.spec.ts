/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { InGridComponent, InGridDoctype } from "../profile-ingrid";
import { ResearchService } from "../../app/+research/research.service";
import { MatDialog } from "@angular/material/dialog";
import { Metadata } from "../../app/models/ige-document";
import { of, throwError } from "rxjs";

describe("Coupled service publication check", () => {
  const hasService = vi.fn();
  const open = vi.fn();
  let check: ReturnType<InGridComponent["getAdditionalPublicationCheck"]>;
  const metadata = {
    uuid: "dataset",
    docType: InGridDoctype.InGridGeoDataset,
  } as Metadata;

  beforeEach(() => {
    vi.clearAllMocks();
    // Exercise the publication callback independently of the component's plugin registration.
    const component = Object.create(
      InGridComponent.prototype,
    ) as InGridComponent;
    component.researchService = {
      hasCoupledServiceWithGetCapabilities: hasService,
    } as unknown as ResearchService;
    component.dialog = { open } as unknown as MatDialog;
    check = component["getAdditionalPublicationCheck"]();
  });

  it("allows publication without a dialog when no coupled service exists", async () => {
    hasService.mockReturnValue(of(false));
    expect(await check({}, metadata, false)).toBe(true);
    expect(hasService).toHaveBeenCalledWith("dataset");
    expect(open).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "keeps the dialog result %s when a coupled service exists",
    async (confirmed) => {
      hasService.mockReturnValue(of(true));
      open.mockReturnValue({ afterClosed: () => of(confirmed) });
      expect(await check({}, metadata, false)).toBe(confirmed);
      expect(open).toHaveBeenCalledOnce();
    },
  );

  it("skips the lookup for addresses and datasets with a format", async () => {
    expect(await check({}, metadata, true)).toBe(true);
    expect(
      await check({ distribution: { format: ["format"] } }, metadata, false),
    ).toBe(true);
    expect(hasService).not.toHaveBeenCalled();
  });

  it("propagates lookup errors without approving publication", async () => {
    hasService.mockReturnValue(throwError(() => new Error("lookup failed")));
    await expect(check({}, metadata, false)).rejects.toThrow("lookup failed");
    expect(open).not.toHaveBeenCalled();
  });
});
