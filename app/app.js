import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  customEvents: {
    paste: 'paste',
  },
});

loadInitializers(App, config.modulePrefix);

export default App;
