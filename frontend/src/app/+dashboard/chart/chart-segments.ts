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
export type ChartSegmentColor = "dark" | "orange" | "blue" | "red" | "hatched";

export interface ChartSegment {
  /** number of documents represented by this segment */
  value: number;
  label: string;
  /** defaults to "dark" */
  color?: ChartSegmentColor;
  /** value for the data-cy attribute, used in e2e tests */
  cy?: string;
}

export interface DocumentStateCounts {
  /** documents in state "W" (draft) */
  numDrafts: number;
  /** documents in state "P" */
  numPublished: number;
  /** documents in state "PW" (published with working version) */
  numPublishedWithDraft?: number;
}

export interface PublicationRightCounts {
  numInternet: number;
  numIntranet: number;
  numAmtsintern: number;
}

/**
 * Maps document state counts to chart segments.
 *
 * The segments are drawn clockwise, starting at 12 o'clock:
 * "published with working version" (hatched), "draft" (orange), "published" (dark).
 */
export function createChartSegments(
  counts: DocumentStateCounts,
  translate: (key: string) => string,
): ChartSegment[] {
  const publishedWithDraft = counts.numPublishedWithDraft ?? 0;

  return [
    {
      value: publishedWithDraft,
      label: translate("docState.PW"),
      color: "hatched",
    },
    {
      value: counts.numDrafts ?? 0,
      label: translate("docState.W"),
      color: "orange",
      cy: "editModeDocument",
    },
    {
      value: counts.numPublished ?? 0,
      label: translate("docState.P"),
      color: "dark",
      cy: "publishModeDocument",
    },
  ];
}

/**
 * Maps publication right counts (wrapper tags) to chart segments, in the order
 * of the table columns: internet, intranet, amtsintern.
 *
 * The colors follow the tag dots shown on the document icons:
 * intranet = blue, amtsintern = red, internet (no tag) = dark like the icon.
 */
export function createRightsChartSegments(
  counts: PublicationRightCounts,
  translate: (key: string) => string,
): ChartSegment[] {
  return [
    {
      value: counts.numInternet ?? 0,
      label: translate("tags.internet"),
      color: "dark",
    },
    {
      value: counts.numIntranet ?? 0,
      label: translate("tags.intranet"),
      color: "blue",
    },
    {
      value: counts.numAmtsintern ?? 0,
      label: translate("tags.amtsintern"),
      color: "red",
    },
  ];
}
