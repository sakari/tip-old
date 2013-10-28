var peg = require('pegjs')
var fs = require('fs')
var fspath = require('path')

function Tip() {
    this._parser = peg.buildParser(
	fs.readFileSync(fspath.join(fspath.dirname(__filename), 'tip.peg')
			, 'utf8')
	, { trackLineAndColumn: true })
}

Tip.prototype.parse = function(str) {
    return this._parser.parse(str)
}

module.exports = Tip
