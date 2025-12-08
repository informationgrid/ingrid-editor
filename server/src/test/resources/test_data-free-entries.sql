-- Seed data for free-entries API tests

-- Do not truncate; IntegrationTest already prepares base catalog/users

-- Use VALUES form to match column order defined in schema; safe if already exists
INSERT INTO catalog VALUES (100, 'test-catalog', 'ingrid', 'Test Catalog', 'Test Catalog Description', now(), now(), NULL)
ON CONFLICT (id) DO NOTHING;


-- Helper: published document with two free entries for codelist 6010 (A and B)
INSERT INTO document VALUES (
    9001, 100, 'free-uuid-1', 'InGridGeoService', 'Test Free Entries Doc 1', '{
      "someField": {
        "_codelistId": "6010",
        "key": null,
        "value": "Free A"
      },
      "anotherField": {
        "_codelistId": "6010",
        "key": null,
        "value": "Free B"
      }
    }',
    0, now(), now(), null, null, null, null, true, 'PUBLISHED'
);

-- Another document with a duplicate free entry "Free A" (should increase count)
INSERT INTO document VALUES (
    9002, 100, 'free-uuid-2', 'InGridGeoService', 'Test Free Entries Doc 2', '{
      "nested": {
        "deep": {
          "_codelistId": "6010",
          "key": null,
          "value": "Free A"
        }
      }
    }',
    0, now(), now(), null, null, null, null, true, 'DRAFT'
);

-- Archived document containing another "Free A" (must be excluded)
INSERT INTO document VALUES (
    9003, 100, 'free-uuid-3', 'InGridGeoService', 'Archived Free Entries Doc', '{
      "field": {
        "_codelistId": "6010",
        "key": null,
        "value": "Free A"
      }
    }',
    0, now(), now(), null, null, null, null, true, 'ARCHIVED'
);

-- Document whose wrapper is deleted; contains "Free B" (must be excluded)
INSERT INTO document VALUES (
    9004, 100, 'free-uuid-4', 'InGridGeoService', 'Deleted Wrapper Doc', '{
      "field": {
        "_codelistId": "6010",
        "key": null,
        "value": "Free B"
      }
    }',
    0, now(), now(), null, null, null, null, true, 'PUBLISHED'
);

-- Wrappers for the documents above
INSERT INTO document_wrapper VALUES (9001, 100, NULL, 'free-uuid-1', 'InGridGeoService', 'data', 0);
INSERT INTO document_wrapper VALUES (9002, 100, NULL, 'free-uuid-2', 'InGridGeoService', 'data', 0);
INSERT INTO document_wrapper VALUES (9003, 100, NULL, 'free-uuid-3', 'InGridGeoService', 'data', 0);
INSERT INTO document_wrapper VALUES (9004, 100, NULL, 'free-uuid-4', 'InGridGeoService', 'data', 1);
