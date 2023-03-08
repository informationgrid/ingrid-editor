INSERT INTO document(id, catalog_id, uuid, type, title, data, version, created, modified, state)
VALUES (1014, 100, '222-approval-222', 'UvpApprovalProcedureDoc', 'Approval1', '{
  "eiaNumbers": [
    {
      "key": "8"
    }
  ],
  "prelimAssessment": true,
  "processingSteps": [
    {
      "type": "publicDisclosure",
      "furtherDocs": null,
      "disclosureDate": {
        "start": "2022-01-05T23:00:00.000Z",
        "end": "2022-01-18T23:00:00.000Z"
      }
    },
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2022-01-22T23:00:00.000Z"
    }
  ]
}', 0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', 'PUBLISHED');


INSERT INTO document_wrapper
VALUES (2012, 100, NULL, '222-approval-222', 'UvpApprovalProcedureDoc', 'data',
        NULL, null, 0);