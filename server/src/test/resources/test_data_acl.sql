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
INSERT INTO catalog VALUES (100, 'test_catalog', 'uvp', 'Test Catalog', 'Test Catalog Description', now(), now(), NULL);
INSERT INTO catalog VALUES (101, 'test_catalog_2', 'mcloud', 'Test Catalog 2', NULL, now(), now(), NULL);

-- users
INSERT INTO user_info VALUES (10, 'user1', NULL, '{"recentLogins": [1604100256021]}');
INSERT INTO catalog_user_info VALUES (100, 10);

-- documents and wrappers

-- draft version
INSERT INTO document VALUES (1000, 100, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document', '{
        "company": "LWL-Schulverwaltung Münster",
        "lastName": "Mustermann",
        "firstName": "Petra"
    }',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', '', null, null, null, true, 'DRAFT'
);
-- published version
INSERT INTO document VALUES (1001, 100, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document Published', '{
        "company": "LWL-Schulverwaltung Münster-Neuenstein",
        "lastName": "Mustermann",
        "firstName": "Petra"
    }',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, false, 'PUBLISHED'
);
-- archived version 1
INSERT INTO document VALUES (1002, 100, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document', '{
        "lastName": "Mustermann",
        "firstName": "Petra"
    }',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, false, 'ARCHIVED'
);
-- folder
INSERT INTO document VALUES (1003, 100, 'bc365545-e4b5-4359-bfb5-84367513752e', 'FOLDER', 'Test Folder', null,
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'DRAFT'
);
-- archived folder
INSERT INTO document VALUES (1004, 100, '5545bc36-b5e4-3549-b5bf-7513752e8436', 'FOLDER', 'Test Folder Old', null,
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'DRAFT'
);
INSERT INTO document VALUES (1005, 100, '365545bc-5e4b-3954-5bfb-72e584361375', 'FOLDER', 'Test Folder Older', null,
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'DRAFT'
);

INSERT INTO document_wrapper VALUES (2000, 100, NULL, '5d2ff598-45fd-4516-b843-0b1787bd8264', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2010, 100, 2000, '8f891e4e-161e-4d2c-6869-03f02ab352dc', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2100, 100, NULL, 'c689240d-e7a9-45cc-b761-44eda0cda1f1', 'FOLDER', 'data', 0);

INSERT INTO document_wrapper VALUES (2110, 100, 2100, '3fae0d5e-087f-4c26-a580-f59e54296b38', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2200, 100, NULL, 'e80b856b-dbea-4f88-99e6-c554bf18480e', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2210, 100, 2200, 'e3b3ba5a-29e0-428e-96b2-20c2b1c92f7d', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2300, 100, NULL, '3ce4cf2e-2baf-4ec9-9439-9a9b7afee087', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2310, 100, 2300, '7289c68d-f036-4d61-932c-855ac408bde1', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2320, 100, 2310, '5c065bb7-ec46-4cab-bb02-8de2a814230b', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2400, 100, NULL, 'a211c074-6952-41ed-846c-824ed630a4e9', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2410, 100, 2400, '7a97b378-b01c-4da7-88e3-623a092d83c1', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2420, 100, 2410, '0516d6de-9043-4439-a1e6-6b5b9c7bd6d5', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2500, 100, NULL, '96c339ea-5caa-487a-a35d-4129f2fb9e06', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2510, 100, 2500, 'b304f85d-b8ff-470c-828c-700f384e3bcd', 'FOLDER', 'data', 0);
INSERT INTO document_wrapper VALUES (2520, 100, 2510, '17cafb6e-3356-4225-8040-a62b11a5a8eb', 'FOLDER', 'data', 0);

INSERT INTO document_wrapper VALUES (2002, 100, 2000, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'address', 0);

INSERT INTO document_archive VALUES (2002, 1002);

-- behaviours
INSERT INTO behaviour VALUES (200, 100, 'plugin.session.timeout', true, '{
        "duration": 1200
    }'
);
INSERT INTO behaviour VALUES (201, 100, 'plugin.sort.tree.by.type', false, '{
    }'
);
INSERT INTO behaviour VALUES (202, 100, 'plugin.address.title', true, '{
        "template": "address template"
    }'
);

-- audit log
INSERT INTO audit_log VALUES (300, 'AuditLog', '{
        "cat": "data-history",
        "data": {
            "uuid": "36169aa1-5faf-4d8e-9dd6-18c95012312d", "id": "41", "type": "mCloudDoc",
            "title": "Test", "version": 1, "created": "2020-10-01T21:06:43.353678100+02:00", "modified": "2020-10-01T21:06:43.353678100+02:00"
        },
        "time": "2020-10-01T21:06:43.389732400+02:00", "actor": "user1", "action": "create", "target": "36169aa1-5faf-4d8e-9dd6-18c95012312d"
    }',
    'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '52', 'audit.data-history', 'http-nio-8550-exec-6', 'INFO',
    '2020-10-13 14:00:54.551484+00'
);
INSERT INTO audit_log VALUES (301, 'AuditLog', '{
        "cat": "data-history",
        "data": {
            "uuid": "36169aa1-5faf-4d8e-9dd6-18c95012312d", "id": "41", "type": "mCloudDoc",
            "title": "Test", "description": "Test description", "version": 1, "created": "2020-10-01T21:06:43.353678100+02:00", "modified": "2020-10-01T21:06:43.353678100+02:00"
        },
        "time": "2020-10-01T21:06:43.389732400+02:00", "actor": "user1", "action": "update", "target": "36169aa1-5faf-4d8e-9dd6-18c95012312d"
    }',
    'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '52', 'audit.data-history', 'http-nio-8550-exec-6', 'INFO',
    '2020-10-13 14:01:54.551484+00'
);
INSERT INTO audit_log VALUES (302, 'AuditLog', '{
        "cat": "data-history",
        "data": {
            "uuid": "4e91e8f8-1e16-c4d2-6689-02adc03fb352", "id": "41", "type": "mCloudDoc",
            "title": "Test2", "version": 1, "created": "2020-10-01T21:06:43.353678100+02:00", "modified": "2020-10-01T21:06:43.353678100+02:00"
        },
        "time": "2020-10-01T21:06:43.389732400+02:00", "actor": "user1", "action": "delete", "target": "4e91e8f8-1e16-c4d2-6689-02adc03fb352"
    }',
    'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '52', 'audit.data-history', 'http-nio-8550-exec-6', 'INFO',
    '2020-10-13 14:02:54.551484+00'
);


-- PERMISSIONS

-- Folder (5d2ff598-45fd-4516-b843-0b1787bd8264)        READ
--   Folder (8f891e4e-161e-4d2c-6869-03f02ab352dc)      READ (implicit)
-- Folder (c689240d-e7a9-45cc-b761-44eda0cda1f1)        WRITE
--   Folder (3fae0d5e-087f-4c26-a580-f59e54296b38)      WRITE (implicit)
-- Folder (e80b856b-dbea-4f88-99e6-c554bf18480e)        WRITESUBTREE
--   Folder (e3b3ba5a-29e0-428e-96b2-20c2b1c92f7d)      WRITE (implicit)
-- Folder (3ce4cf2e-2baf-4ec9-9439-9a9b7afee087)
--   Folder (7289c68d-f036-4d61-932c-855ac408bde1)      READ
--     Folder (5c065bb7-ec46-4cab-bb02-8de2a814230b)    READ (implicit)
-- Folder (a211c074-6952-41ed-846c-824ed630a4e9)
--   Folder (7a97b378-b01c-4da7-88e3-623a092d83c1)      WRITE
--     Folder (0516d6de-9043-4439-a1e6-6b5b9c7bd6d5)    WRITE (implicit)
-- Folder (96c339ea-5caa-487a-a35d-4129f2fb9e06)
--   Folder (b304f85d-b8ff-470c-828c-700f384e3bcd)      WRITESUBTREE
--     Folder (17cafb6e-3356-4225-8040-a62b11a5a8eb)    WRITE (implicit)


-- add permission groups
INSERT INTO public.acl_sid (id, principal, sid) VALUES (1, false, 'GROUP_READTREE');
INSERT INTO public.acl_sid (id, principal, sid) VALUES (2, false, 'GROUP_WRITETREE');
INSERT INTO public.acl_sid (id, principal, sid) VALUES (3, false, 'GROUP_WRITESUBTREE');

-- add entity class to protect
INSERT INTO public.acl_class (id, class, class_id_type) VALUES (1, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'java.lang.Integer');

-- add documents for protection
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (1, 1, 2000, null, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (2, 1, 2010, 1, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (3, 1, 2100, null, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (4, 1, 2110, 3, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (5, 1, 2200, null, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (6, 1, 2210, 5, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (7, 1, 2300, null, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (8, 1, 2310, 7, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (9, 1, 2320, 8, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (10, 1, 2400, null, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (11, 1, 2410, 10, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (12, 1, 2420, 11, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (13, 1, 2500, null, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (14, 1, 2510, 13, 1, true);
INSERT INTO public.acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES (15, 1, 2520, 14, 1, true);

-- connect documents with permission groups
-- read access for GROUP_READTREE
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (1, 1, 1, 1, 1, true, true, true);
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (2, 8, 1, 1, 1, true, true, true);

-- read and write access for GROUP_WRITETREE
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (3, 3, 1, 2, 1, true, true, true);
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (4, 3, 2, 2, 2, true, true, true);
-- write access to sub folder with no read access to parent
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (5, 11, 1, 2, 1, true, true, true);
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (6, 11, 2, 2, 2, true, true, true);

-- read and write (only for children) access for GROUP_WRITESUBTREE
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (7, 5, 1, 3, 1, true, true, true);
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (8, 5, 2, 3, 32, true, true, true);
-- write subtree permission with no read access to parent
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (9, 14, 1, 3, 1, true, true, true);
INSERT INTO public.acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (10, 14, 2, 3, 32, true, true, true);
