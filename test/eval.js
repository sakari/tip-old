var should = require('should')
var Tip = require('../src/tip')
var fs = require('fs')
var vm = require('vm')

describe('compile', function() {
    var tip
    beforeEach(function() {
	tip = new Tip()
    })

    function evaluate(file, arg) {
	var result = { arg: arg}
	return vm.runInNewContext(tip.compile(fs.readFileSync(file, 'utf8')), result)
    }

    it('produces evaluable code', function() {
	evaluate('fixtures/test.tip', 1).should.eql(2)
    })
})
