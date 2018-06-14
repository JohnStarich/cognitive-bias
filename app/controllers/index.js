import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import utils from '../utils';

const otherPeopleCount = 3;
const AgreementCoefficient = 1/5;
const TrustCoefficient = 10;
const BeliefCount = 3;

export default Controller.extend({
  statements: inject(),
  flashMessages: inject(),

  win: false,

  notWin: computed('win', function() {
    return this.get('win') !== false;
  }),

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
      let chosenTopics = utils.chooseRandomElements(topics, BeliefCount);
      return chosenTopics.map((topic, topicId) => {
        return store.createRecord('belief', {
          id: `person-${personId}-belief-${topicId}`,
          topic: topic,
          agreement: Math.round(Math.random() * 100),
        });
      });
    };
    let chosenNames = utils.chooseRandomElements(names, otherPeopleCount);
    let chosenColors = utils.chooseRandomElements(colors, otherPeopleCount);
    let otherPeople = utils.generateRange(otherPeopleCount)
      .map(personIndex => {
        return store.createRecord('person', {
          id: `person-${personIndex + 1}`,
          name: chosenNames[personIndex],
          beliefs: makeBeliefs(personIndex),
          trustLevel: 0,
          color: chosenColors[personIndex],
        });
      });
    this.set('player', player);
    this.set('people', otherPeople);
  },

  updatePlayerBeliefs(sentence, topic, agreement) {
    const store = this.get('store');
    const player = this.get('player');
    this.set('chat', '');
    const currentBeliefs = player.get('beliefs').toArray();
    const topicId = topic.get('id');
    let foundBelief = currentBeliefs.find(belief => belief.get('topic.id') === topicId);
    if (foundBelief !== undefined) {
      foundBelief.set('agreement', agreement);
      foundBelief.set('sentence', sentence);
      return;
    }

    let belief = store.createRecord('belief', {
      id: `${new Date().toString()}-${Math.random()}`,
      topic: topic,
      agreement: agreement,
      sentence: sentence,
    });
    currentBeliefs.push(belief);
    player.set('beliefs', currentBeliefs);
  },

  updateOtherPeopleBeliefs(topic, playerAgreement) {
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
      if (playerAgreement > 50) {
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

    if (this.get('averageTrust') == 100) {
      this.set('win', true);
    }
  },

  averageTrust: computed('people.@each.trustLevel', function() {
    const mean = this.get('people')
      .reduce((movingAvg, person) => {
        let trustLevel = person.get('trustLevel');
        movingAvg.mean = (movingAvg.mean * movingAvg.count + trustLevel) / (movingAvg.count + 1);
        movingAvg.count += 1;
        return movingAvg;
      }, {count: 0, mean: 0})
      .mean;
    return Math.round(mean);
  }),

  actions: {
    say(sentence) {
      let sentenceTopic = this.get('statements').extractAgreement(sentence);
      if (sentenceTopic === undefined) {
        this.get('flashMessages').danger("Unrecognized topic. Try re-wording it to match someone's beliefs.");
        return;
      }
      let {topic, agreement} = sentenceTopic;
      this.updatePlayerBeliefs(sentence, topic, agreement);
      this.updateOtherPeopleBeliefs(topic, agreement);
    },

    paste() {
      return false;
    },
  },
});

const defaultTopics = [
  {
    description: ["NASCAR is great", "we need more NASCAR", "NASCAR is good"],
    negatedDescription: ["NASCAR is alright", "we need less NASCAR", "NASCAR is bad"],
  },
  {
    description: ["tomatoes are vegetables", "tomatoes are fruits"],
    negatedDescription: ["tomatoes are not vegetables", "tomatoes are not fruits"],
  },
  {
    description: ["sleep is optional", "sleep is not important", "sleep is bad"],
    negatedDescription: ["sleep is not optional", "sleep is important", "sleep is good"],
  },
  {
    description: ["we need fewer guns", "guns are bad"],
    negatedDescription: ["we need more guns", "guns are good"],
  },
  {
    description: ["war is good", "war is peace"],
    negatedDescription: ["war is wrong", "war is bad"],
  },
  {
    description: ["ignorance is strength", "ignorance is good"],
    negatedDescription: ["ignorance is weakness", "ignorance is bad"],
  },
  {
    description: ["universal healthcare is harmful", "universal healthcare is bad"],
    negatedDescription: ["universal healthcare is good", "universal healthcare is helpful"],
  },
  {
    description: ["weed should be legal", "weed should not be illegal"],
    negatedDescription: ["weed should be illegal", "weed should not be legal"],
  },
  {
    description: ["obedience is best", "obedience is important", "independence is bad"],
    negatedDescription: ["independence is important", "independence is good", "obedience is bad"],
  },
  {
    description: ["selfishness is useful", "selfishness is good"],
    negatedDescription: ["selfishness is harmful", "selfishness is bad"],
  },
  {
    description: ["freedom is good", "slavery is bad"],
    negatedDescription: ["freedom is slavery", "freedom is bad", "slavery is good"],
  },
];

const colors = [
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "teal",
];

const names = [
  "Alice",
  "Bob",
  "Candice",
  "Daniel",
  "Elise",
  "Fred",
  "Gloria",
];
