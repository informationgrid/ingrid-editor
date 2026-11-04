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
  applyCatalogTheme,
  CATALOG_ACCENT_BODY_CLASS,
  CATALOG_ACCENT_VARIABLE,
  CATALOG_THEME_PRESETS,
  getCatalogAccent,
} from "./catalog-theme";

describe("catalogTheme", () => {
  const rootStyle = () => document.documentElement.style;

  describe("getCatalogAccent", () => {
    it("returns the accent color of a preset", () => {
      expect(getCatalogAccent("teal")).toBe(
        CATALOG_THEME_PRESETS.find((p) => p.key === "teal").accent,
      );
    });

    it("returns null for unknown, empty or missing keys", () => {
      expect(getCatalogAccent("unknown")).toBe(null);
      expect(getCatalogAccent("")).toBe(null);
      expect(getCatalogAccent(undefined)).toBe(null);
      expect(getCatalogAccent(null)).toBe(null);
    });

    it("has unique preset keys", () => {
      const keys = CATALOG_THEME_PRESETS.map((p) => p.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("keeps preset keys in sync with the server CATALOG_THEMES", () => {
      // Mirror CATALOG_THEMES from CatalogSettings.kt.
      const serverThemeKeys = [
        "teal",
        "blue",
        "petrol",
        "navy",
        "green",
        "violet",
      ];
      expect(CATALOG_THEME_PRESETS.map((preset) => preset.key)).toEqual(
        serverThemeKeys,
      );
    });
  });

  describe("applyCatalogTheme", () => {
    afterEach(() => applyCatalogTheme(null));

    it("sets the accent variable and the body class", () => {
      applyCatalogTheme("blue");

      expect(rootStyle().getPropertyValue(CATALOG_ACCENT_VARIABLE)).toBe(
        getCatalogAccent("blue"),
      );
      expect(document.body.classList.contains(CATALOG_ACCENT_BODY_CLASS)).toBe(
        true,
      );
    });

    it("overrides the palette variables", () => {
      applyCatalogTheme("blue");

      const blue = CATALOG_THEME_PRESETS.find((p) => p.key === "blue");
      expect(rootStyle().getPropertyValue("--ige-primary")).toBe(blue.primary);
      expect(rootStyle().getPropertyValue("--ige-secondary")).toBe(
        blue.secondary,
      );
      expect(rootStyle().getPropertyValue("--ige-secondary-dark")).toBe(
        blue.secondaryDark,
      );
      expect(rootStyle().getPropertyValue("--ige-primary-light")).toBe(
        blue.primaryLight,
      );
      expect(rootStyle().getPropertyValue("--ige-mark-color")).toBe(blue.mark);
    });

    it("removes everything without theme", () => {
      applyCatalogTheme("blue");
      applyCatalogTheme(undefined);

      expect(rootStyle().getPropertyValue(CATALOG_ACCENT_VARIABLE)).toBe("");
      expect(rootStyle().getPropertyValue("--ige-primary")).toBe("");
      expect(document.body.classList.contains(CATALOG_ACCENT_BODY_CLASS)).toBe(
        false,
      );
    });

    it("switches the palette when the theme changes", () => {
      applyCatalogTheme("teal");
      applyCatalogTheme("violet");

      const violet = CATALOG_THEME_PRESETS.find((p) => p.key === "violet");
      expect(rootStyle().getPropertyValue("--ige-primary")).toBe(
        violet.primary,
      );
      expect(rootStyle().getPropertyValue(CATALOG_ACCENT_VARIABLE)).toBe(
        violet.accent,
      );
    });
  });
});
