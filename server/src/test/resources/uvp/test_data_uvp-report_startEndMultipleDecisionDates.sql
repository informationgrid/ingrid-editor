INSERT INTO document(id, catalog_id, uuid, type, title, data, version, created, modified, state)
VALUES (1014, 100, '222-approval-222', 'UvpApprovalProcedureDoc', 'Approval1', '{
  "eiaNumbers": [
    {
      "key": "10"
    }
  ],
  "receiptDate": "2021-10-03T22:00:00.000Z",
  "prelimAssessment": true,
  "processingSteps": [
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2021-09-13T22:00:00.000Z"
    },
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2021-10-10T22:00:00.000Z"
    },
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2021-08-13T22:00:00.000Z"
    }
  ]
}', 0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', 'PUBLISHED');


INSERT INTO document_wrapper
VALUES (2012, 100, NULL, '222-approval-222', 'UvpApprovalProcedureDoc', 'data', 0);