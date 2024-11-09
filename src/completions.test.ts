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
            assert.doesNotThrow(() => completions.downloadCompletions(item.source));
        });
    });

    test(`downloadCompletions sets completions export`, async () => {
        assert.equal(undefined, completions.completions);
        await completions.downloadCompletions(constants.configuration.source.MASTER);
        assert.notEqual(undefined, completions.completions);
    });
});
