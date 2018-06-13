"use strict";



define('cognitive-bias/app', ['exports', 'cognitive-bias/resolver', 'ember-load-initializers', 'cognitive-bias/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default,

    // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
    customEvents: {
      paste: 'paste'
    }
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('cognitive-bias/components/flash-message', ['exports', 'ember-cli-flash/components/flash-message'], function (exports, _flashMessage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _flashMessage.default;
    }
  });
});
define('cognitive-bias/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('cognitive-bias/controllers/index', ['exports', 'cognitive-bias/utils'], function (exports, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var otherPeopleCount = 3;
  var AgreementCoefficient = 1 / 5;
  var TrustCoefficient = 10;
  var BeliefCount = 3;

  exports.default = Ember.Controller.extend({
    statements: Ember.inject.service(),
    flashMessages: Ember.inject.service(),

    win: false,

    notWin: Ember.computed('win', function () {
      return this.get('win') !== false;
    }),

    init: function init() {
      this._super.apply(this, arguments);

      var store = this.get('store');
      var player = store.createRecord('person', {
        id: "person-0",
        name: "You"
      });
      var topics = defaultTopics.map(function (topic, index) {
        return store.createRecord('topic', Object.assign({ id: index }, topic));
      });
      var makeBeliefs = function makeBeliefs(personId) {
        var chosenTopics = _utils.default.chooseRandomElements(topics, BeliefCount);
        return chosenTopics.map(function (topic, topicId) {
          return store.createRecord('belief', {
            id: 'person-' + personId + '-belief-' + topicId,
            topic: topic,
            agreement: Math.round(Math.random() * 100)
          });
        });
      };
      var chosenNames = _utils.default.chooseRandomElements(names, otherPeopleCount);
      var chosenColors = _utils.default.chooseRandomElements(colors, otherPeopleCount);
      var otherPeople = _utils.default.generateRange(otherPeopleCount).map(function (personIndex) {
        return store.createRecord('person', {
          id: 'person-' + (personIndex + 1),
          name: chosenNames[personIndex],
          beliefs: makeBeliefs(personIndex),
          trustLevel: 0,
          color: chosenColors[personIndex]
        });
      });
      this.set('player', player);
      this.set('people', otherPeople);
    },
    updatePlayerBeliefs: function updatePlayerBeliefs(sentence, topic, agreement) {
      var store = this.get('store');
      var player = this.get('player');
      this.set('chat', '');
      var currentBeliefs = player.get('beliefs').toArray();
      var topicId = topic.get('id');
      var foundBelief = currentBeliefs.find(function (belief) {
        return belief.get('topic.id') === topicId;
      });
      if (foundBelief !== undefined) {
        foundBelief.set('agreement', agreement);
        foundBelief.set('sentence', sentence);
        return;
      }

      var belief = store.createRecord('belief', {
        id: new Date().toString() + '-' + Math.random(),
        topic: topic,
        agreement: agreement,
        sentence: sentence
      });
      currentBeliefs.push(belief);
      player.set('beliefs', currentBeliefs);
    },
    updateOtherPeopleBeliefs: function updateOtherPeopleBeliefs(topic, playerAgreement) {
      var topicId = topic.get('id');
      this.get('people').forEach(function (person) {
        var beliefs = person.get('beliefs');
        var belief = beliefs.find(function (belief) {
          return belief.get('topic.id') === topicId;
        });
        if (belief === undefined) {
          return;
        }
        var trust = person.get('trustLevel');
        var personAgreement = belief.get('agreement');
        var agreementSimilarity = (100 - Math.abs(playerAgreement - personAgreement)) / 100;
        var agreementMultiplier = agreementSimilarity * AgreementCoefficient + trust / 100;
        if (playerAgreement > 50) {
          agreementMultiplier = 1 + agreementMultiplier;
        } else {
          agreementMultiplier = 1 - agreementMultiplier;
        }
        var newAgreement = personAgreement * agreementMultiplier;
        newAgreement = Math.min(100, Math.max(1, newAgreement));
        belief.set('agreement', newAgreement);

        var newTrust = trust + agreementSimilarity * TrustCoefficient;
        newTrust = Math.min(100, Math.max(1, newTrust));
        person.set('trustLevel', newTrust);
      });

      if (this.get('averageTrust') == 100) {
        this.set('win', true);
      }
    },


    averageTrust: Ember.computed('people.@each.trustLevel', function () {
      var mean = this.get('people').reduce(function (movingAvg, person) {
        var trustLevel = person.get('trustLevel');
        movingAvg.mean = (movingAvg.mean * movingAvg.count + trustLevel) / (movingAvg.count + 1);
        movingAvg.count += 1;
        return movingAvg;
      }, { count: 0, mean: 0 }).mean;
      return Math.round(mean);
    }),

    actions: {
      say: function say(sentence) {
        var sentenceTopic = this.get('statements').extractAgreement(sentence);
        if (sentenceTopic === undefined) {
          this.get('flashMessages').danger("Unrecognized topic. Try re-wording it to match someone's beliefs.");
          return;
        }
        var topic = sentenceTopic.topic,
            agreement = sentenceTopic.agreement;

        this.updatePlayerBeliefs(sentence, topic, agreement);
        this.updateOtherPeopleBeliefs(topic, agreement);
      },
      paste: function paste() {
        return false;
      }
    }
  });


  var defaultTopics = [{
    description: ["tomatoes are vegetables", "tomatoes are fruits"],
    negatedDescription: ["tomatoes are not vegetables", "tomatoes are not fruits"]
  }, {
    description: ["sleep is optional", "sleep is not important", "sleep is bad"],
    negatedDescription: ["sleep is not optional", "sleep is important", "sleep is good"]
  }, {
    description: ["we need fewer guns", "guns are bad"],
    negatedDescription: ["we need more guns", "guns are good"]
  }, {
    description: ["war is good", "war is peace"],
    negatedDescription: ["war is wrong", "war is bad"]
  }, {
    description: ["ignorance is strength", "ignorance is good"],
    negatedDescription: ["ignorance is weakness", "ignorance is bad"]
  }, {
    description: ["universal healthcare is harmful", "universal healthcare is bad"],
    negatedDescription: ["universal healthcare is good", "universal healthcare is helpful"]
  }, {
    description: ["weed should be legal", "weed should not be illegal"],
    negatedDescription: ["weed should be illegal", "weed should not be legal"]
  }, {
    description: ["obedience is best", "obedience is important", "independence is bad"],
    negatedDescription: ["independence is important", "independence is good", "obedience is bad"]
  }, {
    description: ["selfishness is useful", "selfishness is good"],
    negatedDescription: ["selfishness is harmful", "selfishness is bad"]
  }, {
    description: ["freedom is good", "slavery is bad"],
    negatedDescription: ["freedom is slavery", "freedom is bad", "slavery is good"]
  }];

  var colors = ["red", "blue", "green", "purple", "orange", "teal"];

  var names = ["Alice", "Bob", "Candice", "Daniel", "Elise", "Fred", "Gloria"];
});
define('cognitive-bias/flash/object', ['exports', 'ember-cli-flash/flash/object'], function (exports, _object) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _object.default;
    }
  });
});
define('cognitive-bias/helpers/app-version', ['exports', 'cognitive-bias/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var version = _environment.default.APP.version;
    // e.g. 1.0.0-alpha.1+4jds75hf

    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility
    var versionOnly = hash.versionOnly || hash.hideSha;
    var shaOnly = hash.shaOnly || hash.hideVersion;

    var match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      }
      // Fallback to just version
      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define('cognitive-bias/helpers/person-head', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.personHead = personHead;
  function personHead(color) {
    if (color === undefined) {
      color = "";
    }
    return Ember.String.htmlSafe('\n    <svg class="person-head" fill="' + color + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26" version="1.1" width="26px" height="26px">\n    <g id="surface1">\n    <path d="M 16.5625 15.898438 C 16.402344 15.847656 15.398438 15.394531 16.027344 13.484375 L 16.019531 13.484375 C 17.65625 11.800781 18.90625 9.085938 18.90625 6.414063 C 18.90625 2.308594 16.175781 0.15625 13 0.15625 C 9.824219 0.15625 7.109375 2.308594 7.109375 6.414063 C 7.109375 9.097656 8.351563 11.820313 10 13.503906 C 10.640625 15.1875 9.492188 15.8125 9.253906 15.898438 C 5.929688 17.101563 2.03125 19.292969 2.03125 21.457031 C 2.03125 22.039063 2.03125 21.6875 2.03125 22.269531 C 2.03125 25.214844 7.742188 25.886719 13.03125 25.886719 C 18.328125 25.886719 23.96875 25.214844 23.96875 22.269531 C 23.96875 21.6875 23.96875 22.039063 23.96875 21.457031 C 23.96875 19.230469 20.050781 17.054688 16.5625 15.898438 Z "/>\n    </g>\n    </svg>\n  ');
  }

  exports.default = Ember.Helper.helper(personHead);
});
define('cognitive-bias/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('cognitive-bias/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('cognitive-bias/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'cognitive-bias/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var name = void 0,
      version = void 0;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('cognitive-bias/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('cognitive-bias/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('cognitive-bias/initializers/export-application-global', ['exports', 'cognitive-bias/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('cognitive-bias/initializers/flash-messages', ['exports', 'cognitive-bias/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  var deprecate = Ember.deprecate;

  var merge = Ember.assign || Ember.merge;
  var INJECTION_FACTORIES_DEPRECATION_MESSAGE = '[ember-cli-flash] Future versions of ember-cli-flash will no longer inject the service automatically. Instead, you should explicitly inject it into your Route, Controller or Component with `Ember.inject.service`.';
  var addonDefaults = {
    timeout: 3000,
    extendedTimeout: 0,
    priority: 100,
    sticky: false,
    showProgress: false,
    type: 'info',
    types: ['success', 'info', 'warning', 'danger', 'alert', 'secondary'],
    injectionFactories: ['route', 'controller', 'view', 'component'],
    preventDuplicates: false
  };

  function initialize() {
    var application = arguments[1] || arguments[0];

    var _ref = _environment.default || {},
        flashMessageDefaults = _ref.flashMessageDefaults;

    var _ref2 = flashMessageDefaults || [],
        injectionFactories = _ref2.injectionFactories;

    var options = merge(addonDefaults, flashMessageDefaults);
    var shouldShowDeprecation = !(injectionFactories && injectionFactories.length);

    application.register('config:flash-messages', options, { instantiate: false });
    application.inject('service:flash-messages', 'flashMessageDefaults', 'config:flash-messages');

    deprecate(INJECTION_FACTORIES_DEPRECATION_MESSAGE, shouldShowDeprecation, {
      id: 'ember-cli-flash.deprecate-injection-factories',
      until: '2.0.0'
    });

    options.injectionFactories.forEach(function (factory) {
      application.inject(factory, 'flashMessages', 'service:flash-messages');
    });
  }

  exports.default = {
    name: 'flash-messages',
    initialize: initialize
  };
});
define("cognitive-bias/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('cognitive-bias/models/belief', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    statements: Ember.inject.service(),

    topic: _emberData.default.belongsTo('topic'),
    agreement: _emberData.default.attr(), // a percentage where 0 = disagree completely, 50 = no opinion, 100 = agree completely

    sentence: Ember.computed('topic', 'agreement', function () {
      var topic = this.get('topic');
      var agreement = this.get('agreement');
      return this.get('statements').generateSentence(topic, agreement);
    })
  });
});
define('cognitive-bias/models/person', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    name: _emberData.default.attr(),
    beliefs: _emberData.default.hasMany('belief'),
    trustLevel: _emberData.default.attr(), // percentage of trust the person has in the player
    color: _emberData.default.attr(),

    believesAnything: Ember.computed('trustLevel', function () {
      return this.get('trustLevel') == 100;
    })
  });
});
define('cognitive-bias/models/topic', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    description: _emberData.default.attr(),
    negatedDescription: _emberData.default.attr()
  });
});
define('cognitive-bias/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('cognitive-bias/router', ['exports', 'cognitive-bias/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {});

  exports.default = Router;
});
define('cognitive-bias/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define('cognitive-bias/services/flash-messages', ['exports', 'ember-cli-flash/services/flash-messages'], function (exports, _flashMessages) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _flashMessages.default;
    }
  });
});
define('cognitive-bias/services/statements', ['exports', 'cognitive-bias/utils'], function (exports, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    store: Ember.inject.service(),

    generateSentence: function generateSentence(topic, agreement) {
      var certainty = void 0;
      var description = void 0;
      if (agreement > 50) {
        certainty = (agreement - 50) / 50.0;
        description = _utils.default.randomElement(topic.get('description'));
      } else {
        certainty = (50 - agreement) / 50.0;
        description = _utils.default.randomElement(topic.get('negatedDescription'));
      }
      var certaintyIndex = Math.floor(certainty * (certaintyPrefixes.length - 1));
      if (certaintyIndex === 0) {
        description = _utils.default.randomElement(topic.get('description'));
      }

      var prefixOptions = certaintyPrefixes[certaintyIndex];
      var prefix = prefixOptions[_utils.default.randomInt(prefixOptions.length)];
      var suffix = certaintySuffixes[_utils.default.randomInt(certaintySuffixes.length)];
      return '' + prefix + description + suffix;
    },
    extractAgreement: function extractAgreement(sentence) {
      var store = this.get('store');
      var lowerSentence = sentence.toLowerCase();
      var prefixIndex = certaintyPrefixes.findIndex(function (prefixes) {
        return prefixes.find(function (prefix) {
          return lowerSentence.startsWith(prefix.toLowerCase());
        }) !== undefined;
      });
      if (prefixIndex === -1) {
        prefixIndex = certaintyPrefixes.length - 1;
      }
      var certainty = prefixIndex / certaintyPrefixes.length;
      var allTopics = store.peekAll('topic').toArray();
      var positiveMatch = allTopics.find(function (topic) {
        return topic.get('description').find(function (desc) {
          return lowerSentence.includes(desc);
        });
      });
      if (positiveMatch !== undefined) {
        var agreement = 50 + certainty * 50;
        return { agreement: agreement, topic: positiveMatch };
      }
      var negativeMatch = allTopics.find(function (topic) {
        return topic.get('negatedDescription').find(function (desc) {
          return lowerSentence.includes(desc);
        });
      });
      if (negativeMatch !== undefined) {
        var _agreement = 50 - certainty * 50;
        return { agreement: _agreement, topic: negativeMatch };
      }
      return undefined;
    }
  });


  var certaintyPrefixes = [["I don't know whether or not ", "I don't know if ", "I am not sure if ", "I'm not sure if "], ["Rumor has it that ", "I am told ", "I'm told "], ["I have heard ", "I've heard ", "I have read ", "I've read "], ["I think ", "I believe "], ["I am pretty sure ", "I'm pretty sure ", "I am sure ", "I'm sure "], ["I am certain ", "I'm certain "], ["Obviously ", "I know for a fact ", "Clearly "]];

  var certaintySuffixes = "........!";
});
define("cognitive-bias/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Dl1dHRbo", "block": "{\"symbols\":[\"flash\"],\"statements\":[[6,\"header\"],[10,\"class\",\"site-header\"],[8],[0,\"\\n\\t\"],[6,\"h1\"],[10,\"class\",\"site-title\"],[8],[0,\"Cognitive Bias\"],[9],[0,\"\\n\\t\"],[6,\"h2\"],[10,\"class\",\"site-tagline\"],[8],[0,\"A game to explore cognitive biases we experience in our daily lives\"],[9],[0,\"\\n\"],[9],[0,\"\\n\\n\"],[6,\"div\"],[10,\"class\",\"alerts-container\"],[8],[0,\"\\n\\t\"],[6,\"div\"],[10,\"class\",\"alerts\"],[8],[0,\"\\n\"],[4,\"each\",[[22,[\"flashMessages\",\"queue\"]]],null,{\"statements\":[[0,\"\\t\\t\"],[1,[26,\"flash-message\",null,[[\"flash\"],[[21,1,[]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"\\t\"],[9],[0,\"\\n\"],[9],[0,\"\\n\\n\"],[1,[20,\"outlet\"],false],[0,\"\\n\\n\"],[6,\"footer\"],[10,\"class\",\"site-footer\"],[8],[0,\"\\n\\t© 2018 John Starich\\n\"],[9],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "cognitive-bias/templates/application.hbs" } });
});
define("cognitive-bias/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "tP4fBHyp", "block": "{\"symbols\":[\"person\",\"belief\",\"belief\"],\"statements\":[[6,\"div\"],[11,\"class\",[26,\"if\",[[22,[\"win\"]],\"win-status win\",\"win-status\"],null],null],[8],[0,\"\\n\"],[4,\"if\",[[22,[\"win\"]]],null,{\"statements\":[[0,\"\\t\\t\"],[6,\"div\"],[10,\"class\",\"win-description\"],[8],[0,\"\\n\\t\\t\\t\"],[6,\"h2\"],[8],[0,\"Congratulations, you won!\"],[9],[0,\"\\n\\t\\t\\t\"],[6,\"p\"],[8],[0,\"In this game, you may have noticed how easy it is for people to change their minds and agree with you — even if you only state your beliefs. \"],[9],[0,\"\\n\\t\\t\\t\"],[6,\"p\"],[8],[6,\"em\"],[8],[0,\"If a statement feels familiar or is repeated often enough, you are more likely to believe it is true.\"],[9],[9],[0,\"\\n\\t\\t\\t\"],[6,\"p\"],[8],[0,\"This is a form of cognitive bias called “the illusory truth effect.” You can read more about the effect through its research\"],[6,\"a\"],[10,\"class\",\"source\"],[10,\"target\",\"_blank\"],[10,\"href\",\"https://doi.org/10.5964%2Fejop.v8i2.456\"],[8],[0,\"1\"],[9],[6,\"a\"],[10,\"class\",\"source\"],[10,\"target\",\"_blank\"],[10,\"href\",\"https://doi.org/10.1037%2Fa0021323\"],[8],[0,\"2\"],[9],[0,\" or on \"],[6,\"a\"],[10,\"target\",\"_blank\"],[10,\"href\",\"https://en.wikipedia.org/wiki/Illusory_truth_effect\"],[8],[0,\"Wikipedia\"],[9],[0,\". Thanks for playing!\"],[9],[0,\"\\n\\t\\t\"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[9],[0,\"\\n\\n\"],[6,\"div\"],[10,\"class\",\"person player\"],[8],[0,\"\\n\\t\"],[6,\"div\"],[10,\"class\",\"person-identity\"],[8],[0,\"\\n\\t\\t\"],[1,[26,\"person-head\",[[22,[\"player\",\"color\"]]],null],false],[0,\"\\n\\t\\t\"],[6,\"div\"],[10,\"class\",\"person-name\"],[8],[1,[22,[\"player\",\"name\"]],false],[9],[0,\"\\n\\t\"],[9],[0,\"\\n\\t\"],[6,\"div\"],[10,\"class\",\"person-beliefs\"],[8],[0,\"\\n\\t\\t\"],[6,\"ul\"],[8],[0,\"\\n\"],[4,\"each\",[[22,[\"player\",\"beliefs\"]]],null,{\"statements\":[[0,\"\\t\\t\\t\"],[6,\"li\"],[10,\"class\",\"person-belief\"],[8],[1,[21,3,[\"sentence\"]],false],[9],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"\\t\\t\"],[9],[0,\"\\n\\t\\t\"],[1,[26,\"input\",null,[[\"type\",\"placeholder\",\"autofocus\",\"autocomplete\",\"class\",\"enter\",\"value\",\"disabled\",\"paste\"],[\"text\",\"Say something...\",true,\"off\",\"player-chat\",[26,\"action\",[[21,0,[]],\"say\"],null],[22,[\"chat\"]],[22,[\"notWin\"]],[26,\"action\",[[21,0,[]],\"paste\"],null]]]],false],[0,\"\\n\\t\"],[9],[0,\"\\n\\t\"],[6,\"div\"],[10,\"class\",\"trust\"],[8],[0,\"Average trust: \"],[1,[20,\"averageTrust\"],false],[0,\"%\"],[9],[0,\"\\n\"],[9],[0,\"\\n\\n\"],[6,\"ul\"],[10,\"class\",\"person-list\"],[8],[0,\"\\n\"],[4,\"each\",[[22,[\"people\"]]],null,{\"statements\":[[0,\"\\t\"],[6,\"li\"],[10,\"class\",\"person\"],[8],[0,\"\\n\\t\\t\"],[6,\"div\"],[10,\"class\",\"person-identity\"],[8],[0,\"\\n\\t\\t\\t\"],[1,[26,\"person-head\",[[21,1,[\"color\"]]],null],false],[0,\"\\n\\t\\t\\t\"],[6,\"div\"],[10,\"class\",\"person-name\"],[8],[1,[21,1,[\"name\"]],false],[9],[0,\"\\n\\t\\t\"],[9],[0,\"\\n\\t\\t\"],[6,\"ul\"],[10,\"class\",\"person-beliefs\"],[8],[0,\"\\n\"],[4,\"if\",[[21,1,[\"believesAnything\"]]],null,{\"statements\":[[0,\"\\t\\t\\t\"],[6,\"li\"],[10,\"class\",\"person-belief\"],[8],[1,[26,\"if\",[[22,[\"chat\"]],[22,[\"chat\"]],\"...\"],null],false],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"each\",[[21,1,[\"beliefs\"]]],null,{\"statements\":[[0,\"\\t\\t\\t\\t\"],[6,\"li\"],[10,\"class\",\"person-belief\"],[8],[1,[21,2,[\"sentence\"]],false],[9],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[]}],[0,\"\\t\\t\"],[9],[0,\"\\n\\t\"],[9],[0,\"\\n\"]],\"parameters\":[1]},null],[9],[0,\"\\n\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "cognitive-bias/templates/index.hbs" } });
});
define("cognitive-bias/utils", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var utils = {
    generateRange: function generateRange(n) {
      return Array.from({ length: n }, function (value, key) {
        return key;
      });
    },
    randomInt: function randomInt(max) {
      return Math.floor(Math.random() * max);
    },
    randomElement: function randomElement(array) {
      return array[utils.randomInt(array.length)];
    },
    chooseRandomElements: function chooseRandomElements(array, n) {
      var chosenIndices = new Set();
      var chosenElements = [];
      while (chosenElements.length < n || array.length < n) {
        var chosenIndex = utils.randomInt(array.length);
        if (!chosenIndices.has(chosenIndex)) {
          chosenIndices.add(chosenIndex);
          chosenElements.push(array[chosenIndex]);
        }
      }
      return chosenElements;
    }
  };

  exports.default = utils;
});


define('cognitive-bias/config/environment', [], function() {
  var prefix = 'cognitive-bias';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("cognitive-bias/app")["default"].create({"name":"cognitive-bias","version":"0.0.0+88ffa961"});
}
//# sourceMappingURL=cognitive-bias.map
