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
import {
  applyCatalogAccent,
  CATALOG_ACCENT_BODY_CLASS,
  CATALOG_ACCENT_VARIABLE,
  getCatalogAccent,
} from "./catalog-theme";

describe("catalogTheme", () => {
  const themes = {
    "cat-finder": "#00838f",
    "cat-repo": " #1a5a9e ",
  };

  describe("getCatalogAccent", () => {
    it("returns the color of the given catalog", () => {
      expect(getCatalogAccent({ catalogThemes: themes }, "cat-finder")).toBe(
        "#00838f",
      );
    });

    it("trims the configured color", () => {
      expect(getCatalogAccent({ catalogThemes: themes }, "cat-repo")).toBe(
        "#1a5a9e",
      );
    });

    it("returns null for a catalog without entry", () => {
      expect(getCatalogAccent({ catalogThemes: themes }, "cat-other")).toBe(
        null,
      );
    });

    it("returns null for blank colors", () => {
      expect(
        getCatalogAccent({ catalogThemes: { "cat-x": "   " } }, "cat-x"),
      ).toBe(null);
    });

    it("returns null without themes or catalog id", () => {
      expect(getCatalogAccent(undefined, "cat-finder")).toBe(null);
      expect(getCatalogAccent({ catalogThemes: themes }, undefined)).toBe(null);
    });
  });

  describe("applyCatalogAccent", () => {
    afterEach(() => applyCatalogAccent(null));

    it("sets the CSS variable and the body class", () => {
      applyCatalogAccent("#00838f");

      expect(
        document.documentElement.style.getPropertyValue(
          CATALOG_ACCENT_VARIABLE,
        ),
      ).toBe("#00838f");
      expect(document.body.classList.contains(CATALOG_ACCENT_BODY_CLASS)).toBe(
        true,
      );
    });

    it("removes the CSS variable and the body class without color", () => {
      applyCatalogAccent("#00838f");
      applyCatalogAccent(null);

      expect(
        document.documentElement.style.getPropertyValue(
          CATALOG_ACCENT_VARIABLE,
        ),
      ).toBe("");
      expect(document.body.classList.contains(CATALOG_ACCENT_BODY_CLASS)).toBe(
        false,
      );
    });
  });
});
