TRUNCATE TABLE document RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_wrapper RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_archive RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;

-- catalogs
INSERT INTO catalog VALUES (100, 'test_catalog', 'uvp', 'Test Catalog', NULL, NULL);

-- documents and wrappers

-- draft version
INSERT INTO document VALUES (1000, 100, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document', '{
        "company": "LWL-Schulverwaltung Münster",
        "lastName": "Mustermann",
        "firstName": "Petra"
    }',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00'
);
-- published version
INSERT INTO document VALUES (1001, 100, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document Published', '{
        "company": "LWL-Schulverwaltung Münster-Neuenstein",
        "lastName": "Mustermann",
        "firstName": "Petra"
    }',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00'
);
-- archived version 1
INSERT INTO document VALUES (1002, 100, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document', '{
        "lastName": "Mustermann",
        "firstName": "Petra"
    }',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00'
);

INSERT INTO document_wrapper VALUES (1000, 100, NULL, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'address',
    1000, 1001, 0
);

INSERT INTO document_wrapper VALUES (1001, 100, 1000, '8f891e4e-161e-4d2c-6869-03f02ab352dc', 'AddressDoc', 'address',
    NULL, NULL, 0
);

INSERT INTO document_wrapper VALUES (1002, 100, 1000, 'e8f891e4-c4d2-61e1-8669-b350203fadc2', 'AddressDoc', 'address',
    NULL, NULL, 0
);

INSERT INTO document_archive VALUES (1000, 1002);

-- behaviours
INSERT INTO behaviour VALUES (200, 100, 'plugin.session.timeout', true, '{
        "duration": 1200
    }'
);
INSERT INTO behaviour VALUES (201, 100, 'plugin.sort.tree.by.type', true, '{
    }'
);
INSERT INTO behaviour VALUES (202, 100, 'plugin.address.title', false, '{
        "template": null
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
