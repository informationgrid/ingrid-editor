TRUNCATE TABLE document RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_wrapper RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_archive RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog_user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE behaviour RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog RESTART IDENTITY CASCADE;

-- catalogs
INSERT INTO catalog VALUES (100, 'uvp_catalog', 'uvp', 'Test Catalog', 'Test Catalog Description', now(), now(), NULL);

-- users
INSERT INTO user_info VALUES (10, 'user1', NULL, '{"recentLogins": [1604100256021]}');
INSERT INTO catalog_user_info VALUES (100, 10);

-- documents and wrappers

-- published version
INSERT INTO document
VALUES (1001, 100, 'uuid-1', 'UvpApprovalProcedureDoc', 'Anonymized Title', '{
  "processingSteps": [
    {
      "type": "publicDisclosure",
      "disclosureDate": {
        "end": "2020-07-09T22:00:00.000Z",
        "start": "2020-06-10T22:00:00.000Z"
      },
      "announcementDocs": [
        {
          "title": "Anonymized Title",
          "downloadURL": {
            "uri": "anonymized_document_1.pdf",
            "value": "anonymized_document_1.pdf",
            "asLink": false
          }
        }
      ],
      "applicationDocs": [
        {
          "title": "Anonymized Title",
          "downloadURL": {
            "uri": "anonymized_document_2.pdf",
            "value": "anonymized_document_2.pdf",
            "asLink": false
          }
        }
      ],
      "reportsRecommendationDocs": [
        {
          "title": "Anonymized Title",
          "downloadURL": {
            "uri": "anonymized_document_3.pdf",
            "value": "anonymized_document_3.pdf",
            "asLink": false
          }
        }
      ],
      "furtherDocs": [
        {
          "title": "Anonymized Title",
          "downloadURL": {
            "uri": "anonymized_document_4.pdf",
            "value": "anonymized_document_4.pdf",
            "asLink": false
          }
        }
      ]
    },
    {
      "type": "publicHearing",
      "publicHearingDate": {
        "end": "2020-09-01T22:00:00.000Z",
        "start": "2020-09-01T22:00:00.000Z"
      },
      "considerationDocs": [
        {
          "title": "Anonymized Title",
          "downloadURL": {
            "uri": "anonymized_document_5.pdf",
            "value": "anonymized_document_5.pdf",
            "asLink": false
          }
        }
      ]
    },
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2022-05-01T22:00:00.000Z",
      "approvalDocs": [
        {
          "title": "Anonymized Title",
          "downloadURL": {
            "uri": "https://anonymized-link.com",
            "value": "https://anonymized-link.com",
            "asLink": true
          }
        }
      ],
      "decisionDocs": [
        {
          "title": "Anonymized Title",
          "downloadURL": {
            "uri": "https://anonymized-link.com",
            "value": "https://anonymized-link.com",
            "asLink": true
          }
        }
      ]
    }
  ]
}',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'PUBLISHED')
;

INSERT INTO document_wrapper VALUES (1, 100, null, 'uuid-1', 'UvpApprovalProcedureDoc', 'data', 0);

-- behaviours
INSERT INTO behaviour VALUES (200, 100, 'plugin.session.timeout', true, '{
        "duration": 1200
    }'
);

