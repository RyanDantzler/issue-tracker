const Mocha       = require('mocha');
const fs          = require('fs');
const path        = require('path');

const mocha = new Mocha();
const testDir = './tests'

// Add each .js file to the mocha instance
fs.readdirSync(testDir).filter(function (file) {
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function (file) {
    mocha.addFile(
        path.join(testDir, file)
    );
});

exports.run = () => {
  mocha.ui('tdd').run();
};