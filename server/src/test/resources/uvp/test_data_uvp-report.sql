TRUNCATE TABLE document RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_wrapper RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_archive RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog_user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE behaviour RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog RESTART IDENTITY CASCADE;
TRUNCATE TABLE acl_class RESTART IDENTITY CASCADE;
TRUNCATE TABLE acl_entry RESTART IDENTITY CASCADE;
TRUNCATE TABLE acl_object_identity RESTART IDENTITY CASCADE;
TRUNCATE TABLE acl_sid RESTART IDENTITY CASCADE;

-- catalogs
INSERT INTO catalog
VALUES (100, 'test_catalog', 'uvp', 'Test Catalog', 'Test Catalog Description', now(), now(), NULL);

-- users
INSERT INTO user_info
VALUES (10, 'user1', NULL, '{
  "recentLogins": [
    1604100256021
  ]
}');
INSERT INTO catalog_user_info
VALUES (100, 10);

-- documents and wrappers

-- published version
INSERT INTO document(id, catalog_id, uuid, type, title, data, version, created, modified, state)
VALUES (1001, 100, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document Published', '{
  "company": "LWL-Schulverwaltung Münster-Neuenstein",
  "lastName": "Mustermann",
  "firstName": "Petra"
}',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', 'PUBLISHED'),
       (1010, 100, '5d2ff598-45fd-4516-b843-0b1787bd8264', 'UvpApprovalProcedureDoc', 'Approval1', '{
         "eiaNumbers": [
           {
             "key": "32"
           },
           {
             "key": "6"
           }
         ],
         "receiptDate": "2022-10-03T22:00:00.000Z",
         "prelimAssessment": true,
         "processingSteps": [
           {
             "type": "decisionOfAdmission",
             "decisionDate": "2022-10-06T22:00:00.000Z"
           }
         ]
       }',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', 'PUBLISHED'),
       (1011, 100, '8f891e4e-161e-4d2c-6869-03f02ab352dc', 'UvpApprovalProcedureDoc', 'Approval2', '{
         "eiaNumbers": [
           {
             "key": "3"
           },
           {
             "key": "6"
           }
         ],
         "receiptDate": "2022-10-03T22:00:00.000Z",
         "prelimAssessment": false,
         "processingSteps": [
           {
             "type": "decisionOfAdmission",
             "decisionDate": "2022-10-08T22:00:00.000Z"
           }
         ]
       }',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', 'PUBLISHED');



INSERT INTO document_wrapper
VALUES (2000, 100, NULL, '5d2ff598-45fd-4516-b843-0b1787bd8264', 'UvpApprovalProcedureDoc', 'data', 0);
INSERT INTO document_wrapper
VALUES (2010, 100, 2000, '8f891e4e-161e-4d2c-6869-03f02ab352dc', 'UvpApprovalProcedureDoc', 'data', 0);


INSERT INTO document_wrapper
VALUES (2002, 100, 2000, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'UvpAddressDoc', 'address', 0);

-- INSERT INTO document_wrapper
-- VALUES (2003, 100, NULL, '', 'UvpAddressDoc', 'data', null, null, 0);

insert into version_info(key, value)
values ('test', '2')