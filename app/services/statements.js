import Service from '@ember/service';
import utils from '../utils';
import { inject } from '@ember/service';

export default Service.extend({
  store: inject(),

  generateSentence(topic, agreement) {
    let certainty;
    let description;
    if (agreement > 50) {
      certainty = (agreement - 50) / 50.0;
      description = utils.randomElement(topic.get('description'));
    } else {
      certainty = (50 - agreement) / 50.0;
      description = utils.randomElement(topic.get('negatedDescription'));
    }
    let certaintyIndex = Math.floor(certainty * (certaintyPrefixes.length - 1));
    if (certaintyIndex === 0) {
      description = utils.randomElement(topic.get('description'));
    }

    let prefixOptions = certaintyPrefixes[certaintyIndex];
    let prefix = prefixOptions[utils.randomInt(prefixOptions.length)];
    let suffix = certaintySuffixes[utils.randomInt(certaintySuffixes.length)];
    return `${prefix}${description}${suffix}`;
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
    let positiveMatch =
      allTopics.find(topic =>
        topic.get('description').find(desc =>
          lowerSentence.includes(desc)));
    if (positiveMatch !== undefined) {
      const agreement = 50 + certainty * 50;
      return {agreement: agreement, topic: positiveMatch};
    }
    let negativeMatch =
      allTopics.find(topic =>
        topic.get('negatedDescription').find(desc =>
          lowerSentence.includes(desc)));
    if (negativeMatch !== undefined) {
      const agreement = 50 - certainty * 50;
      return {agreement: agreement, topic: negativeMatch};
    }
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
