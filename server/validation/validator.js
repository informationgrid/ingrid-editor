let glob = require('glob')
  , path = require('path');

let validate = require("validate.js");

/**
 * Class to handle the validation of a document.
 * Depending on the configuration other validation rules might apply.
 * The constraints are built on startup and if a behaviour was activated or deactivated. These constraints are then used
 * to check against the document.
 * We use the validatejs library: https://validatejs.org/
 */
class Validator {

  /*
  The constraints holds all validation information for all document profiles.
  <profile_name>: {
    <field_name>: [func1, func2, ...]
  }
   */

  constructor() {
    this.constraints = {};
    this.priorityMap = {};

    glob.sync('./validation/uvp/**/*.js').forEach(file => {
      console.log('loading rule: ', file);
      let rule = require(path.resolve(file));

      // if it's the first rule for a profile
      if (!this.constraints[rule.profile]) {
        this.constraints[rule.profile] = {};
      }

      // if it's a new rule for a field
      let constraintField = this.constraints[rule.profile][rule.field];
      if (!constraintField) {
        this.constraints[rule.profile][rule.field] = constraintField = {};
      }

      if (typeof rule.validate === 'object') {
        let keys = Object.keys(rule.validate);
        keys.forEach(key => {
          // check priority first
          let hasPriority = this.checkPriority(rule.profile, rule.field, key, rule.priority);

          if (hasPriority) {
            constraintField = this.addOrMergeRule(key, constraintField, rule.validate);
          }

        });

      } else {
        console.error('Strange validate object: ', rule.validate);
      }
    });
  }

  /**
   *
   * @param doc
   * @returns {Promise}
   */
  run(doc) {

    // let constraints = {
    //   description: {
    //     presence: false,
    //     length: {
    //       minimum: 3
    //     }
    //   },
    //   taskId: function (value, attributes, attributeName, options, constraints) {
    //     let titleIsEmpty = validate.isEmpty(attributes.title);
    //     if (titleIsEmpty) {
    //       return null;
    //     } else {
    //       return {
    //         presence: {message: "is required when title is not empty"},
    //         length: {is: 5}
    //       };
    //     }
    //   }
    // };

    // let contraints = this.prepareConstraints();
    let errors = validate.validate(doc, this.constraints[doc._profile]);

    return new Promise(function (resolve, reject) {
      if (errors) {
        reject(errors);
      } else {
        resolve(errors);
      }
    });
  }

  /**
   * Get the constraints for a specific profile. For each field of a document one or more rules can be applied.
   * So in the validate function we have to iterate through all defined constraints  and call those.
   * @returns {{}}
   */
  prepareConstraints() {
    let result = {};


    for (let i = 0; i < this.constraints.length; i++) {
      // TODO: only add validator if constraint is active (check in settings)
      let key = this.constraints[i].key;
      if (result[key]) {
        // merge constraint with existing ones
      } else {
        // add new constraint
      }
    }

    return result;
  }

  /**
   * Register a contraint for a profile and a field of the document.
   * @param {string}profile
   * @param {string} field
   * @param {function} constraint
   */
  register(profile, field, constraint) {
    this.constraints[profile][field].push(constraint);
  }

  addOrMergeRule(key, constraintField, validate) {
    if (constraintField[key] === undefined) {
      constraintField[key] = validate[key];
    } else {
      constraintField[key] = validate[key];
    }
    return constraintField;
  }

  checkPriority(profile, field, key, priority) {
    this.preparePriorityMap(profile, field, key);

    if (this.priorityMap[profile][field][key].priority === undefined
      || this.priorityMap[profile][field][key].priority < priority) {

      this.priorityMap[profile][field][key].priority = priority;
    } else {
      // only return false if a rule does not have a higher priority!
      return false;
    }

    return true;
  }

  preparePriorityMap(profile, field, key) {
    if (!this.priorityMap[profile]) {
      this.priorityMap[profile] = {};
      this.priorityMap[profile][field] = {};
      this.priorityMap[profile][field][key] = {};
    } else if (!this.priorityMap[profile][field]) {
      this.priorityMap[profile][field] = {};
      this.priorityMap[profile][field][key] = {};
    } else if (!this.priorityMap[profile][field][key]) {
      this.priorityMap[profile][field][key] = {};
    }
  }
}

module.exports = new Validator();
