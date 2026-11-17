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
export const CATALOG_ACCENT_VARIABLE = "--catalog-accent";
export const CATALOG_ACCENT_BODY_CLASS = "catalog-accent";

export interface CatalogThemePreset {
  /** stored in the catalog settings, must match the server's CATALOG_THEMES */
  key: string;
  label: string;
  /** catalog name in the header; needs AA contrast on white */
  accent: string;
  /** palette: titles, links (replaces $ige-primary) */
  primary: string;
  /** palette: buttons, link text (replaces $ige-secondary) */
  secondary: string;
  /** palette: sidebar background (replaces $ige-secondary-dark) */
  secondaryDark: string;
  /**
   * palette: active tab label on the secondaryDark tab bar (replaces
   * $ige-primary-light); keep the contrast of the default (~6.4:1)
   */
  primaryLight: string;
  /** palette: selected / highlighted background (replaces $ige-mark-color) */
  mark: string;
}

export const CATALOG_THEME_PRESETS: CatalogThemePreset[] = [
  {
    key: "teal",
    label: "Türkis",
    accent: "#007a89",
    primary: "#007a89",
    secondary: "#0a4e5a",
    secondaryDark: "#073a43",
    primaryLight: "#00cee7",
    mark: "#e6f6f8",
  },
  {
    key: "blue",
    label: "Blau",
    accent: "#2c63b1",
    primary: "#2c63b1",
    secondary: "#1d4b7b",
    secondaryDark: "#143a60",
    primaryLight: "#a9c3ea",
    mark: "#eaf1fa",
  },
  {
    key: "petrol",
    label: "Petrol",
    accent: "#0c6b80",
    primary: "#0c6b80",
    secondary: "#0c505d",
    secondaryDark: "#083841",
    primaryLight: "#2dc9eb",
    mark: "#e8f4f7",
  },
  {
    key: "navy",
    label: "Marineblau",
    accent: "#005ca9",
    primary: "#005ca9",
    secondary: "#003063",
    secondaryDark: "#002147",
    primaryLight: "#46abff",
    mark: "#eaf6ff",
  },
  {
    key: "green",
    label: "Grün",
    accent: "#3d7a14",
    primary: "#3d7a14",
    secondary: "#285010",
    secondaryDark: "#1a380a",
    primaryLight: "#68cf22",
    mark: "#eef7e6",
  },
  {
    key: "violet",
    label: "Violett",
    accent: "#7a3f9d",
    primary: "#7a3f9d",
    secondary: "#4a2563",
    secondaryDark: "#331845",
    primaryLight: "#c09ad6",
    mark: "#f4ecf8",
  },
];

const PALETTE_VARIABLES: { [variable: string]: keyof CatalogThemePreset } = {
  "--ige-primary": "primary",
  "--ige-secondary": "secondary",
  "--ige-secondary-dark": "secondaryDark",
  "--ige-primary-light": "primaryLight",
  "--ige-mark-color": "mark",
};

export function getCatalogThemePreset(
  key: string | undefined | null,
): CatalogThemePreset | null {
  return CATALOG_THEME_PRESETS.find((preset) => preset.key === key) ?? null;
}

/** Accent color of a theme key, null if there is no (known) theme. */
export function getCatalogAccent(
  key: string | undefined | null,
): string | null {
  return getCatalogThemePreset(key)?.accent ?? null;
}

export function applyCatalogTheme(key: string | undefined | null): void {
  const preset = getCatalogThemePreset(key);
  const root = document.documentElement;

  if (preset) {
    root.style.setProperty(CATALOG_ACCENT_VARIABLE, preset.accent);
    document.body.classList.add(CATALOG_ACCENT_BODY_CLASS);
  } else {
    root.style.removeProperty(CATALOG_ACCENT_VARIABLE);
    document.body.classList.remove(CATALOG_ACCENT_BODY_CLASS);
  }

  Object.entries(PALETTE_VARIABLES).forEach(([variable, field]) => {
    if (preset) {
      root.style.setProperty(variable, preset[field]);
    } else {
      root.style.removeProperty(variable);
    }
  });
}
