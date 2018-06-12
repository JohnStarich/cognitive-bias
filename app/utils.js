const utils = {
  generateRange(n) {
    return Array.from({length: n}, (value, key) => key);
  },

  randomInt(max) {
    return Math.floor(Math.random() * max);
  },

  randomElement(array) {
    return array[utils.randomInt(array.length)];
  },

  chooseRandomElements(array, n) {
    let chosenIndices = new Set();
    let chosenElements = [];
    while(chosenElements.length < n || array.length < n) {
      let chosenIndex = utils.randomInt(array.length);
      if (! chosenIndices.has(chosenIndex)) {
        chosenIndices.add(chosenIndex);
        chosenElements.push(array[chosenIndex]);
      }
    }
    return chosenElements;
  },
};

export default utils;
