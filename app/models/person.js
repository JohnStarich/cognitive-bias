import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  beliefs: DS.hasMany('belief'),
  trustLevel: DS.attr(), // percentage of trust the person has in the player
  color: DS.attr(),

  believesAnything: computed('trustLevel', function() {
    return this.get('trustLevel') == 100;
  }),
});
