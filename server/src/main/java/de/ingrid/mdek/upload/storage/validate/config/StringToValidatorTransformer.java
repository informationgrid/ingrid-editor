/*-
 * **************************************************-
 * InGrid Portal MDEK Application
 * ==================================================
 * Copyright (C) 2014 - 2021 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * http://ec.europa.eu/idabc/eupl5
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.mdek.upload.storage.validate.config;

import com.tngtech.configbuilder.annotation.typetransformer.TypeTransformer;
import de.ingrid.mdek.upload.storage.validate.Validator;
import de.ingrid.mdek.upload.storage.validate.ValidatorFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * TypeTransformer class used to transform the validators configuration value to a list of validator instances.
 */
public class StringToValidatorTransformer extends TypeTransformer<String, Map<String, Validator>> {

    @Override
    public Map<String, Validator> transform(final String argument) {
        final Map<String, Validator> result = new HashMap<>();
        final ValidatorFactory factory = new ValidatorFactory(argument);
        for (final String name : factory.getValidatorNames()) {
            result.put(name, factory.getValidator(name));
        }
        return result;
    }
}
