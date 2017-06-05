
class Titlel2Field {


  constructor() {
    // the profile where this rule should apply
    this.profile = 'UVP';

    // the field to apply this rule to
    this.field = 'title';

    // the priority in case another rule for this profile and field occurs
    this.priority = 1;

    // the linked behaviour name if this rule can be toggled
    // this.linkToBehaviour = 'xxx';

    //
    this.validate = {
      presence: false,
      length: { minimum: 3 }
    };
  }

}

module.exports = new Titlel2Field();
