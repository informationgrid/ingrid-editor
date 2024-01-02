/**
 * ==================================================
 * Copyright (C) 2014-2024 wemove digital solutions GmbH
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
package de.ingrid.mdek.upload.storage;

/**
 * Enumeration of file actions.
 */
public enum Action {
    CREATE("create"),
    READ("read"),
    DELETE("delete");

    private final String name;

    private Action(String s) {
        this.name = s;
    }

    public static Action lookup(String name) {
        for (Action action : values()) {
            if (action.toString().equalsIgnoreCase(name)) {
                return action;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return this.name;
    }
}
