import * as assert from 'assert';
import * as completions from './completions';
var constants = require('./constants');

suite('Completions Test Suite', () => {

    [
        { source: constants.configuration.source.BETA },
        { source: constants.configuration.source.MASTER },
        { source: constants.configuration.source.RELEASE },
    ].forEach(function (item) {
        test(`downloadCompletions does not throw given expected configuration '${item.source}'`, () => {
            assert.doesNotThrow(() => completions.getCompletions(item.source));
        });
    });
});
