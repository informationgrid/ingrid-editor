INSERT INTO document(id, catalog_id, uuid, type, title, data, version, created, modified, state)
VALUES (1012, 100, '111-negative-111', 'UvpNegativePreliminaryAssessmentDoc', 'Negative1', '{
  "decisionDate": "2022-10-02T22:00:00.000Z"
}',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', 'PUBLISHED');

INSERT INTO document_wrapper
VALUES (2011, 100, 2000, '111-negative-111', 'UvpNegativePreliminaryAssessmentDoc', 'data', 0);