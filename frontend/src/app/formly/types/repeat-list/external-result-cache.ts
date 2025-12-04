/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { SelectOption } from "../../../services/codelist/codelist.service";

const MAX_CACHE_SIZE = 500;

export class ExternalResultsCache {
  private cache: SelectOption[] = [];

  constructor(
    private deduplicate: (
      options: SelectOption[],
      externalOptions: SelectOption[],
    ) => SelectOption[],
  ) {}

  /**
   * Adds new results to the cache, deduplicates against existing items, and prunes the array
   * to maintain the MAX_CACHE_SIZE limit (keeping the most recent entries).
   *
   * @param newResults The fresh results fetched from the API (converted to SelectOptionUi)
   */
  public updateCache(newResults: SelectOption[]): void {
    let updatedCache = this.deduplicate(this.cache, newResults);
    this.cache = updatedCache.slice(-MAX_CACHE_SIZE);
  }

  /**
   * Returns a list of cached options that match the current query string.
   * This is used for providing immediate UX feedback during refinement.
   *
   * @param query The current input string
   * @returns A list of filtered SelectOptionUi items
   */
  public filter(query: string): SelectOption[] {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();

    return this.cache.filter((option) =>
      option.label.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Clears the cache.
   */
  public clear(): void {
    this.cache = [];
  }
}
