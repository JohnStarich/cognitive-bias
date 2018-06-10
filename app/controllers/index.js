import Controller from '@ember/controller';

const otherPeopleCount = 3;
const AgreementCoefficient = 1/10;
const TrustCoefficient = 1/2;

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

  updatePlayerBeliefs(topic, positive) {
    const store = this.get('store');
    const player = this.get('player');
    this.set('chat', '');
    const currentBeliefs = player.get('beliefs').toArray();
    const topicId = topic.get('id');
    const agreement = positive === true ? 100 : 0;
    let foundBelief = currentBeliefs.find(belief => belief.get('topic.id') === topicId);
    if (foundBelief !== undefined) {
      foundBelief.set('agreement', agreement);
      return;
    }

    let belief = store.createRecord('belief', {
      id: `${new Date().toString()}-${Math.random()}`,
      topic: topic,
      agreement: agreement,
    });
    currentBeliefs.push(belief);
    player.set('beliefs', currentBeliefs);
  },

  updateOtherPeopleBeliefs(topic, positive) {
    const playerAgreement = positive === true ? 100 : 0;
    const topicId = topic.get('id');
    this.get('people').forEach(person => {
      const beliefs = person.get('beliefs');
      let belief = beliefs.find(belief => belief.get('topic.id') === topicId);
      if (belief === undefined) {
        return;
      }
      const trust = person.get('trustLevel');
      const personAgreement = belief.get('agreement');
      let agreementSimilarity = (100 - Math.abs(playerAgreement - personAgreement)) / 100;
      let agreementMultiplier = agreementSimilarity * AgreementCoefficient + trust / 100;
      if (playerAgreement > personAgreement) {
        agreementMultiplier = 1 + agreementMultiplier;
      } else {
        agreementMultiplier = 1 - agreementMultiplier;
      }
      let newAgreement = personAgreement * agreementMultiplier;
      newAgreement = Math.min(100, Math.max(1, newAgreement));
      belief.set('agreement', newAgreement);

      let newTrust = trust + agreementSimilarity * TrustCoefficient;
      newTrust = Math.min(100, Math.max(1, newTrust));
      person.set('trustLevel', newTrust);
    });
  },

  actions: {
    say(sentence) {
      let sentenceTopic = this._topicForSentence(sentence);
      if (sentenceTopic === undefined) {
        return;
      }
      let {topic, positive} = sentenceTopic;
      this.updatePlayerBeliefs(topic, positive);
      this.updateOtherPeopleBeliefs(topic, positive);
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
