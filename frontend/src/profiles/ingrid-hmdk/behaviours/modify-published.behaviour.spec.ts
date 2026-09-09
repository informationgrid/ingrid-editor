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
import { TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { of, Subject, throwError } from "rxjs";
import { ModifyPublishedBehaviour } from "./modify-published.behaviour";
import { ResearchService } from "../../../app/+research/research.service";
import { DocumentDataService } from "../../../app/services/document/document-data.service";
import { DocEventsService } from "../../../app/services/event/doc-events.service";
import {
  EventResponder,
  EventService,
  IgeEventResultType,
} from "../../../app/services/event/event.service";
import { GeneralStore } from "../../../app/store/general.store";
import { DocumentAbstract } from "../../../app/store/document/document.model";

describe("HmbTG deletion check", () => {
  let behaviour: ModifyPublishedBehaviour;
  const getTitles = vi.fn();
  const open = vi.fn();
  const events = new Subject<EventResponder>();

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ModifyPublishedBehaviour,
        {
          provide: ResearchService,
          useValue: { getHmbtgDocumentTitles: getTitles },
        },
        { provide: MatDialog, useValue: { open } },
        { provide: EventService, useValue: { respondToEvent: () => events } },
        {
          provide: DocEventsService,
          useValue: { onEvent: () => new Subject() },
        },
        { provide: DocumentDataService, useValue: {} },
        { provide: GeneralStore, useValue: {} },
      ],
    });
    behaviour = TestBed.inject(ModifyPublishedBehaviour);
  });

  function deleteEvent() {
    return {
      data: [
        { _uuid: "draft", _state: "W" },
        { _uuid: "published", _state: "P" },
        { _uuid: "modified", _state: "PW" },
      ] as DocumentAbstract[],
      eventResponseHandler: vi.fn(),
    } as unknown as EventResponder;
  }

  it("checks published selections and proceeds if there are no HmbTG titles", async () => {
    getTitles.mockReturnValue(of([]));
    const event = deleteEvent();
    await behaviour["handleDeleteEvent"](event);
    expect(getTitles).toHaveBeenCalledWith(["published", "modified"]);
    expect(open).not.toHaveBeenCalled();
    expect(event.eventResponseHandler).toHaveBeenCalledWith({
      result: IgeEventResultType.SUCCESS,
      data: null,
    });
  });

  it.each([true, false])(
    "keeps the user's confirmation decision %s",
    async (confirmed) => {
      getTitles.mockReturnValue(of(["Same title", "Same title"]));
      open.mockReturnValue({ afterClosed: () => of(confirmed) });
      const event = deleteEvent();
      await behaviour["handleDeleteEvent"](event);
      expect(open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: expect.objectContaining({ list: ["Same title", "Same title"] }),
        }),
      );
      expect(event.eventResponseHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          result: confirmed
            ? IgeEventResultType.SUCCESS
            : IgeEventResultType.FAIL,
        }),
      );
    },
  );

  it("does not approve deletion after a failed lookup", async () => {
    getTitles.mockReturnValue(throwError(() => new Error("lookup failed")));
    const event = deleteEvent();
    await expect(behaviour["handleDeleteEvent"](event)).rejects.toThrow(
      "lookup failed",
    );
    expect(event.eventResponseHandler).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
});
