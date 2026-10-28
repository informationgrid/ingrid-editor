/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission – subsequent versions of the
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
import { Configuration } from "./config.service";

/**
 * Per-catalog accent colors.
 *
 * An installation may host several catalogs with the same profile (e.g. two
 * BAW catalogs). To make them visually distinguishable, each catalog can be
 * assigned an accent color - typically the one of the portal it belongs to -
 * via the frontend configuration (assets/config.json):
 *
 *   "catalogThemes": {
 *     "<catalogId>": "#00838f"
 *   }
 *
 * Applying the color is up to the profile: currently only the BAW profile
 * calls {@link applyCatalogAccent} on startup. If the current catalog has an
 * entry, the color is published as CSS variable `--catalog-accent` on :root
 * and `catalog-accent` is set as body class. All accent styling (viewport
 * frame, header stripe, colored catalog name, form title row) keys off those
 * two hooks, so catalogs without an entry keep the default look.
 */
export const CATALOG_ACCENT_VARIABLE = "--catalog-accent";
export const CATALOG_ACCENT_BODY_CLASS = "catalog-accent";

export function getCatalogAccent(
  config: Pick<Configuration, "catalogThemes"> | undefined | null,
  catalogId: string | undefined,
): string | null {
  if (!catalogId) return null;
  const color = config?.catalogThemes?.[catalogId];
  return typeof color === "string" && color.trim().length > 0
    ? color.trim()
    : null;
}

export function applyCatalogAccent(color: string | null): void {
  if (color) {
    document.documentElement.style.setProperty(CATALOG_ACCENT_VARIABLE, color);
    document.body.classList.add(CATALOG_ACCENT_BODY_CLASS);
  } else {
    document.documentElement.style.removeProperty(CATALOG_ACCENT_VARIABLE);
    document.body.classList.remove(CATALOG_ACCENT_BODY_CLASS);
  }
}
