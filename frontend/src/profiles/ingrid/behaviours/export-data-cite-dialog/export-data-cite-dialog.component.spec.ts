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
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator/vitest";
import { ExportDataCiteDialogComponent } from "./export-data-cite-dialog.component";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { DataSiteService } from "./data-site.service";
import { FormStateService } from "../../../../app/+form/form-state.service";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { provideZonelessChangeDetection, signal } from "@angular/core";
import { of, throwError } from "rxjs";
import { UntypedFormGroup } from "@angular/forms";
import { Metadata } from "../../../../app/models/ige-document";
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { DocumentService } from "../../../../app/services/document/document.service";
import { GeneralStore } from "../../../../app/store/general.store";
import { CodelistStore } from "../../../../app/store/codelist/codelist.store";
import { BehaviourService } from "../../../../app/services/behavior/behaviour.service";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

describe("ExportDataCiteDialogComponent", () => {
  let spectator: Spectator<ExportDataCiteDialogComponent>;
  let dataSiteService: DataSiteService;
  let dialog: MatDialog;
  let snackbar: MatSnackBar;
  let dialogRef: MatDialogRef<ExportDataCiteDialogComponent>;
  let documentService: DocumentService;

  const mockFormValue = {
    title: "test title",
    publication: {
      doi: "10.1234/test-doi",
      generalResourceType: { key: "text" },
    },
    pointOfContact: [
      { type: { key: "10" }, ref: "publisher-ref" },
      { type: { key: "11" }, ref: "creator-ref" },
    ],
    description: "test description",
    temporal: { event: { created: "2020-12-11T23:00:00.000Z" } },
    resource: { useConstraints: [] },
  };

  const mockMetadata: Metadata = {
    docType: "test-doctype",
    uuid: "test-uuid",
  };

  const mockDocument = {
    doi: "10.1234/test-doi",
    creators: [{ name: "Organization Creator", nameType: "Organizational" }],
    alternateIdentifiers: [
      { alternateIdentifierType: "UUID", alternateIdentifier: "test-uuid" },
    ],
    language: "de",
    publisher: "Organization Publisher",
    publicationYear: 2020,
    contributors: [],
    dates: [
      {
        date: "2020-12-11T23:00:00.000Z",
        dateType: "Created",
      },
    ],
    types: { resourceType: undefined, resourceTypeGeneral: "Text" },
    titles: [
      {
        lang: "de",
        title: "test title",
      },
    ],
    descriptions: [
      {
        lang: "de",
        description: "test description",
        descriptionType: "Abstract",
      },
    ],
    rightsList: [],
    geoLocations: [],
    url: "http://detail/test-uuid",
  };

  const createComponent = createComponentFactory({
    component: ExportDataCiteDialogComponent,
    imports: [MatDialogModule, MatSnackBarModule],
    providers: [
      provideZonelessChangeDetection(),
      DataSiteService,
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      mockProvider(DocumentService, {
        load: vi.fn().mockImplementation((id) => {
          if (id === "publisher-ref") {
            return of(<any>{
              metadata: { docType: "InGridOrganisationDoc" },
              document: { organization: "Organization Publisher" },
            });
          } else if (id === "creator-ref") {
            return of(<any>{
              metadata: { docType: "InGridOrganisationDoc" },
              document: { organization: "Organization Creator" },
            });
          } else return of(null);
        }),
      }),
      mockProvider(GeneralStore, {
        catalogLanguage: signal("de"),
      }),
      mockProvider(CodelistStore, {
        getCodelistEntryByKey: vi
          .fn()
          .mockReturnValue({ fields: { de: "Text" } }),
      }),
      mockProvider(BehaviourService, {
        getBehaviour: vi.fn().mockReturnValue({
          data: {
            dataCiteURL: "http://datacite",
            dataCiteDetailURL: "http://detail/",
          },
        }),
      }),
      mockProvider(MatDialogRef, {
        close: vi.fn(),
      }),
      mockProvider(FormStateService, {
        getForm: vi
          .fn()
          .mockReturnValue({ value: mockFormValue } as UntypedFormGroup),
        metadata: signal(mockMetadata),
      }),
      mockProvider(MatDialog, {
        open: vi.fn().mockReturnValue({
          afterClosed: vi
            .fn()
            .mockReturnValue(of({ username: "user", password: "password" })),
        }),
      }),
      mockProvider(MatSnackBar, {
        open: vi.fn(),
      }),
    ],
  });

  beforeEach(() => {
    dataSiteService = TestBed.inject(DataSiteService);
    // Partially mock DataSiteService
    vi.spyOn(dataSiteService, "createDataCite");
    vi.spyOn(dataSiteService, "doiExists").mockReturnValue(of(true));
    vi.spyOn(dataSiteService, "uploadDOI").mockReturnValue(
      of({ success: true }),
    );

    spectator = createComponent();

    dialog = spectator.inject(MatDialog);
    snackbar = spectator.inject(MatSnackBar);
    dialogRef = spectator.inject(MatDialogRef);
    documentService = spectator.inject(DocumentService);
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });

  it("should load document and check if DOI exists on init", async () => {
    // Wait for resource loader
    await spectator.fixture.whenStable();

    expect(dataSiteService.createDataCite).toHaveBeenCalled();
    expect(dataSiteService.doiExists).toHaveBeenCalledWith(
      mockFormValue.publication.doi,
    );
  });

  it("should display correct status message when DOI exists", async () => {
    await spectator.fixture.whenStable();

    expect(spectator.query(".padding-vertical")).toHaveText(
      "Das Dokument existiert bereits und wird aktualisiert.",
    );
  });

  it("should display correct status message when DOI does not exist", async () => {
    // Re-create with different mock value
    vi.mocked(dataSiteService.doiExists).mockReturnValue(of(false));

    // When using signals/resources, we might need to trigger a change or just re-create
    spectator = createComponent();
    await spectator.fixture.whenStable();

    expect(spectator.query(".padding-vertical")).toHaveText(
      'Das Dokument ist noch nicht vorhanden oder nicht im Status "veröffentlicht".',
    );
  });

  it("should display JSON view with document data", async () => {
    await spectator.fixture.whenStable();

    expect(spectator.component.documentResource.value()).toEqual(mockDocument);

    // const jsonView = spectator.query("ige-json-view");
    // expect(jsonView).toBeTruthy();

    // The data might not exactly match mockDocument because it's generated by real createDataCite
    // but it should contain the DOI
    const doc = spectator.component.document();
    expect(doc.doi).toEqual(mockFormValue.publication.doi);
  });

  it("should handle submission", async () => {
    await spectator.fixture.whenStable();

    spectator.component.submit();

    expect(dialog.open).toHaveBeenCalled();
    expect(dataSiteService.uploadDOI).toHaveBeenCalledWith(
      "user",
      "password",
      spectator.component.document(),
    );
    expect(snackbar.open).toHaveBeenCalledWith("DOI erfolgreich hochgeladen.");
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it("should handle upload error", async () => {
    const errorMessage = "Upload failed";
    vi.mocked(dataSiteService.uploadDOI).mockReturnValue(
      throwError(() => ({ status: 401, message: errorMessage })),
    );

    await spectator.fixture.whenStable();
    spectator.component.submit();

    expect(spectator.component["error"]()).toEqual("Ungültige Zugangsdaten");
  });
});
