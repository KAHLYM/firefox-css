import * as assert from 'assert';
import * as childProcess from './childProcess';

suite('Child Process Test Suite', () => {

    test("spawn_ does not throw given valid command", () => {
        assert.doesNotThrow(() => childProcess.spawn_("npm", ["--version"]));
    });

    test("spawnSync_ does not throw given valid command", () => {
        assert.doesNotThrow(() => childProcess.spawnSync_("npm", ["--version"]));
    });
});
