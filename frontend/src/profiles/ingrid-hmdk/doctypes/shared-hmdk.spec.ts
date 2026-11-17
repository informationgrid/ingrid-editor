/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import { UntypedFormControl } from "@angular/forms";
import { SharedHmdk } from "./shared-hmdk";
import { TagsService } from "../../../app/+catalog/+behaviours/system/tags/tags.service";
import { FormStateService } from "../../../app/+form/form-state.service";
import { TranslocoService } from "@jsverse/transloco";
import { CodelistStore } from "../../../app/store/codelist/codelist.store";

describe("HmbTG validators", () => {
  let sharedHmdk: SharedHmdk;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TagsService, useValue: {} },
        { provide: FormStateService, useValue: {} },
        {
          provide: TranslocoService,
          useValue: { translate: (key: string) => key },
        },
        { provide: CodelistStore, useValue: {} },
      ],
    });
    sharedHmdk = TestBed.inject(SharedHmdk);
  });

  /**
   * Mimics the formly structure: the validated field (e.g. "additionalUrls" or
   * "apiUrl") is nested below a keyless root, so the validators have to resolve the
   * document properties via the root model.
   */
  function createField(model: any, formValue: any) {
    const root = { model };
    return {
      parent: root,
      form: { value: formValue },
    } as any;
  }

  describe("urlOrFileWhenHmbtg", () => {
    it("does not fail on null model slices", () => {
      // new documents may contain null values, e.g. "additionalUrls": null
      const field = createField(
        { additionalUrls: null, properties: {} },
        { additionalUrls: null },
      );
      const ctrl = new UntypedFormControl(null);

      expect(() =>
        sharedHmdk.urlOrFileWhenHmbtg.expression(ctrl, field),
      ).not.toThrow();
      expect(sharedHmdk.urlOrFileWhenHmbtg.expression(ctrl, field)).toBe(true);
    });

    it("fails when HmbTG is activated and no link or file is given", () => {
      const field = createField(
        { properties: { publicationHmbTG: true }, additionalUrls: null },
        { additionalUrls: null },
      );
      const ctrl = new UntypedFormControl(null);

      expect(sharedHmdk.urlOrFileWhenHmbtg.expression(ctrl, field)).toBe(false);
    });

    it("passes when HmbTG is activated and a URL is given", () => {
      const field = createField(
        { properties: { publicationHmbTG: true } },
        { apiUrl: "https://www.hamburg.de" },
      );
      const ctrl = new UntypedFormControl(null);

      expect(sharedHmdk.urlOrFileWhenHmbtg.expression(ctrl, field)).toBe(true);
    });

    it("passes when HmbTG is activated and a file is uploaded", () => {
      const field = createField(
        { properties: { publicationHmbTG: true } },
        { fileReferences: [{ filename: "data.csv" }] },
      );
      const ctrl = new UntypedFormControl(null);

      expect(sharedHmdk.urlOrFileWhenHmbtg.expression(ctrl, field)).toBe(true);
    });

    it("passes when HmbTG is not activated", () => {
      const field = createField({ properties: {} }, {});
      const ctrl = new UntypedFormControl(null);

      expect(sharedHmdk.urlOrFileWhenHmbtg.expression(ctrl, field)).toBe(true);
    });
  });

  describe("downloadLinkWhenHmbtg", () => {
    it("does not fail on missing model properties", () => {
      const field = createField({}, { fileReferences: null });
      const ctrl = new UntypedFormControl(null);

      expect(() =>
        sharedHmdk.downloadLinkWhenHmbtg.expression(ctrl, field),
      ).not.toThrow();
      expect(sharedHmdk.downloadLinkWhenHmbtg.expression(ctrl, field)).toBe(
        true,
      );
    });

    it("passes when HmbTG is activated and a download link is given", () => {
      const field = createField(
        { properties: { publicationHmbTG: true } },
        { fileReferences: [] },
      );
      const ctrl = new UntypedFormControl([{ type: { key: "9990" } }] as any);

      expect(sharedHmdk.downloadLinkWhenHmbtg.expression(ctrl, field)).toBe(
        true,
      );
    });

    it("fails when HmbTG is activated and no download link or file is given", () => {
      const field = createField(
        { properties: { publicationHmbTG: true } },
        { fileReferences: [] },
      );
      const ctrl = new UntypedFormControl([{ type: { key: "1" } }] as any);

      expect(sharedHmdk.downloadLinkWhenHmbtg.expression(ctrl, field)).toBe(
        false,
      );
    });
  });

  describe("atLeastOnePublisher", () => {
    it("does not fail on missing model properties", () => {
      const field = createField({}, {});
      const ctrl = new UntypedFormControl(null);

      expect(() =>
        sharedHmdk.atLeastOnePublisher.expression(ctrl, field),
      ).not.toThrow();
      expect(sharedHmdk.atLeastOnePublisher.expression(ctrl, field)).toBe(true);
    });

    it("fails when HmbTG is activated and no publisher is given", () => {
      const field = createField({ properties: { publicationHmbTG: true } }, {});
      const ctrl = new UntypedFormControl(null);

      expect(sharedHmdk.atLeastOnePublisher.expression(ctrl, field)).toBe(
        false,
      );
    });

    it("passes when HmbTG is activated and a publisher is given", () => {
      const field = createField({ properties: { publicationHmbTG: true } }, {});
      const ctrl = new UntypedFormControl([{ type: { key: "10" } }] as any);

      expect(sharedHmdk.atLeastOnePublisher.expression(ctrl, field)).toBe(true);
    });
  });
});
