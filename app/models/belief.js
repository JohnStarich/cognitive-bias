import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  topic: DS.belongsTo('topic'),
  agreement: DS.attr(), // a percentage where 0 = disagree completely, 50 = no opinion, 100 = agree completely

  sentence: computed('topic', 'agreement', function() {
    console.log("running sentence generator");
    let topic = this.get('topic');
    let agreement = this.get('agreement');
    let certainty;
    let description;
    if (agreement > 50) {
      certainty = (agreement - 50) / 50.0;
      description = topic.get('description');
    } else {
      certainty = (50 - agreement) / 50.0;
      description = topic.get('negatedDescription');
    }
    let certaintyIndex = Math.floor(certainty * (certaintyPrefixes.length - 1));
    if (certaintyIndex === 0) {
      description = topic.get('description');
    }

    let prefixOptions = certaintyPrefixes[certaintyIndex];
    let prefix = prefixOptions[this._randomInt(prefixOptions.length)];
    let suffix = certaintySuffixes[this._randomInt(certaintySuffixes.length)];
    return `${prefix}${description}${suffix}`;
  }),

  _randomInt(max) {
    return Math.round(Math.random() * (max - 1));
  },
});

const certaintyPrefixes = [
  ["I don't know whether or not ", "I don't know if ", "I am not sure if "],
  ["Rumor has it that ", "I am told "],
  ["I have heard ", "I have read "],
  ["I think ", "I believe "],
  ["I am pretty sure "],
  ["I am certain "],
  ["Obviously ", "I know for a fact ", "Clearly "],
];

const certaintySuffixes = "........!";
