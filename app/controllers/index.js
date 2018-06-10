import Controller from '@ember/controller';

const otherPeopleCount = 3;

export default Controller.extend({

  init() {
    this._super(...arguments);

    const store = this.get('store');
    let player = store.createRecord('person', {
      id: "person-0",
      name: "You",
    });
    let topics = defaultTopics.map((topic, index) => {
      return store.createRecord('topic', Object.assign({id: index}, topic));
    });
    let makeBeliefs = (personId) => {
      return topics.map((topic, topicId) => {
        return store.createRecord('belief', {
          id: `person-${personId}-belief-${topicId}`,
          topic: topic,
          agreement: Math.round(Math.random() * 100),
        });
      });
    };
    let otherPeople = this._generateRange(otherPeopleCount)
      .map(personIndex => {
        return store.createRecord('person', {
          id: `person-${personIndex + 1}`,
          name: `Person ${personIndex}`,
          beliefs: makeBeliefs(personIndex),
          trustLevel: 0,
          color: colors[personIndex],
        });
      });
    this.set('player', player);
    this.set('people', otherPeople);
  },

  _generateRange(n) {
    return Array.from({length: n}, (value, key) => key);
  },

  _topicForSentence(sentence) {
    const store = this.get('store');
    const allTopics = store.peekAll('topic');
    const lowerSentence = sentence.toLowerCase();
    let positiveMatch = allTopics.find(topic => lowerSentence.includes(topic.get('description')));
    if (positiveMatch !== undefined) {
      return {positive: true, topic: positiveMatch};
    }
    let negativeMatch = allTopics.find(topic => lowerSentence.includes(topic.get('negatedDescription')));
    if (negativeMatch !== undefined) {
      return {positive: false, topic: negativeMatch};
    }
    return undefined;
  },

  actions: {
    say(sentence) {
      const store = this.get('store');
      const player = this.get('player');
      let sentenceTopic = this._topicForSentence(sentence);
      if (sentenceTopic === undefined) {
        return;
      }

      this.set('chat', '');
      const currentBeliefs = player.get('beliefs').toArray();
      let sentenceTopicId = sentenceTopic.topic.get('id');
      let agreement = sentenceTopic.positive === true ? 100 : 0;
      let foundBelief = currentBeliefs.find(belief => belief.get('topic.id') === sentenceTopicId);
      if (foundBelief !== undefined) {
        foundBelief.set('agreement', agreement);
        return;
      }

      let belief = store.createRecord('belief', {
        id: `${new Date().toString()}-${Math.random()}`,
        topic: sentenceTopic.topic,
        agreement: agreement,
      });
      currentBeliefs.push(belief);
      player.set('beliefs', currentBeliefs);
    },
  },
 });

const defaultTopics = [
  {
    description: "tomatoes are vegetables",
    negatedDescription: "tomatoes are not vegetables",
  },
  {
    description: "sleep is optional",
    negatedDescription: "sleep is not optional",
  },
];

const colors = [
  "red",
  "blue",
  "green",
  "magenta",
  "cyan",
];
