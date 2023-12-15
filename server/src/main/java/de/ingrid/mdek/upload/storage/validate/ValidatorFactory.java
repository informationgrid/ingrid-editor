/**
 * ==================================================
 * Copyright (C) 2014-2023 wemove digital solutions GmbH
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
package de.ingrid.mdek.upload.storage.validate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * ValidatorFactory is used to construct and provide Validator implementations
 */
public class ValidatorFactory {

    private final Map<String, Validator> validatorMap = new HashMap<>();

    static class ValidatorDef {
        public String impl;
        public Map<String, String> properties;
    }

    /**
     * Constructor.
     * <p>
     * Initialize the factory with a JSON formatted configuration string of the form:
     * <p>
     * {
     * "validatorA":{
     * "impl":"de.ingrid.mdek.upload.validate.ValidatorA",
     * "properties":{
     * "propA": "configuration property A"
     * }
     * },
     * ...
     * }
     *
     * @param config
     */
    public ValidatorFactory(final Map<String, Map<String, Object>> config) {
        validatorMap.clear();
        try {
            for (final Map.Entry<String, Map<String, Object>> validatorsEntry : config.entrySet()) {
                final String validatorName = validatorsEntry.getKey();
                final Map<String, Object> validatorDef = validatorsEntry.getValue();
                final Validator instance = (Validator) Class.forName(validatorDef.get("impl").toString()).getDeclaredConstructor().newInstance();
                Object properties = validatorDef.get("properties");
                if (properties instanceof List) {
                    instance.initialize(new HashMap<>());
                } else {
                    instance.initialize((Map<String, String>)properties);
                }
                validatorMap.put(validatorName, instance);
            }
        } catch (final Exception e) {
            throw new IllegalArgumentException("Could not parse configuration value into validator list.", e);
        }
    }

    /**
     * Get all validator names
     *
     * @return Set<String>
     */
    public Set<String> getValidatorNames() {
        return validatorMap.keySet();
    }

    /**
     * Get the validator with the given name
     *
     * @param name
     * @return Validator
     */
    public Validator getValidator(final String name) {
        if (validatorMap.containsKey(name)) {
            return validatorMap.get(name);
        }
        throw new IllegalArgumentException("A validator with name '" + name + "' does not exist.");
    }
}
