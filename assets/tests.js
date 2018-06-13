'use strict';

define('cognitive-bias/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/index.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/person-head.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/person-head.js should pass ESLint\n\n');
  });

  QUnit.test('models/belief.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/belief.js should pass ESLint\n\n');
  });

  QUnit.test('models/person.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/person.js should pass ESLint\n\n');
  });

  QUnit.test('models/topic.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/topic.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('services/statements.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/statements.js should pass ESLint\n\n');
  });

  QUnit.test('utils.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'utils.js should pass ESLint\n\n');
  });
});
define('cognitive-bias/tests/test-helper', ['cognitive-bias/app', 'cognitive-bias/config/environment', '@ember/test-helpers', 'ember-qunit'], function (_app, _environment, _testHelpers, _emberQunit) {
  'use strict';

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));

  (0, _emberQunit.start)();
});
define('cognitive-bias/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });
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

require('cognitive-bias/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
