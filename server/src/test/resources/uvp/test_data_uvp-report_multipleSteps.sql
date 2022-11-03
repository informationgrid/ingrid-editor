INSERT INTO document
VALUES (1014, 100, '222-approval-222', 'UvpApprovalProcedureDoc', 'Approval1', '{
  "eiaNumbers": [
    {
      "key": "32"
    },
    {
      "key": "6"
    }
  ],
  "receiptDate": "2022-10-03T22:00:00.000Z",
  "processingSteps": [
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2022-09-13T22:00:00.000Z"
    },
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2022-10-10T22:00:00.000Z"
    },
    {
      "type": "decisionOfAdmission",
      "decisionDate": "2022-08-13T22:00:00.000Z"
    }
  ]
}',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00');


INSERT INTO document_wrapper
VALUES (2012, 100, NULL, '222-approval-222', 'UvpApprovalProcedureDoc', 'data',
        NULL, 1014, 0);