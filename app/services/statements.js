import Service from '@ember/service';
import { inject } from '@ember/service';

export default Service.extend({
  store: inject(),

  generateSentence(topic, agreement) {
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
  },

  _randomInt(max) {
    return Math.round(Math.random() * (max - 1));
  },

  extractAgreement(sentence) {
    const store = this.get('store');
    const lowerSentence = sentence.toLowerCase();
    let prefixIndex = certaintyPrefixes.findIndex(prefixes => {
      return prefixes.find(prefix => lowerSentence.startsWith(prefix.toLowerCase())) !== undefined;
    });
    if (prefixIndex === -1) {
      prefixIndex = certaintyPrefixes.length - 1;
    }
    const certainty = prefixIndex / certaintyPrefixes.length;
    const allTopics = store.peekAll('topic').toArray();
    let positiveMatch = allTopics.find(topic => lowerSentence.includes(topic.get('description')));
    if (positiveMatch !== undefined) {
      const agreement = 50 + certainty * 50;
      return {agreement: agreement, topic: positiveMatch};
    }
    let negativeMatch = allTopics.find(topic => lowerSentence.includes(topic.get('negatedDescription')));
    if (negativeMatch !== undefined) {
      const agreement = 50 - certainty * 50;
      return {agreement: agreement, topic: negativeMatch};
    }
    // TODO notify them that this was an unrecognized topic
    return undefined;
  },
});

const certaintyPrefixes = [
  ["I don't know whether or not ", "I don't know if ", "I am not sure if ", "I'm not sure if "],
  ["Rumor has it that ", "I am told ", "I'm told "],
  ["I have heard ", "I've heard ", "I have read ", "I've read "],
  ["I think ", "I believe "],
  ["I am pretty sure ", "I'm pretty sure ", "I am sure ", "I'm sure "],
  ["I am certain ", "I'm certain "],
  ["Obviously ", "I know for a fact ", "Clearly "],
];

const certaintySuffixes = "........!";
