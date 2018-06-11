import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default DS.Model.extend({
  statements: inject(),

  topic: DS.belongsTo('topic'),
  agreement: DS.attr(), // a percentage where 0 = disagree completely, 50 = no opinion, 100 = agree completely

  sentence: computed('topic', 'agreement', function() {
    let topic = this.get('topic');
    let agreement = this.get('agreement');
    return this.get('statements').generateSentence(topic, agreement);
  }),
});
