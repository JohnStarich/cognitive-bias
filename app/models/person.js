import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  beliefs: DS.hasMany('belief'),
  trustLevel: DS.attr(), // percentage of trust the person has in the player
  color: DS.attr(),
});
