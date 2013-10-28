var should = require('should')
var fs = require('fs')

describe('tip', function() {
    var Tip = require('../src/tip')
    var tip
    beforeEach(function() {
	tip = new Tip()
    })
    it('parses the example file', function() {
	console.log(JSON.stringify(
	    tip.parse(fs.readFileSync('example.tip', 'utf8')), null, 4))
    })

    it('parses float literals', function() {
	tip.parse('30.01')[0].should.eql({ type: 'number', value: '30.01'})
    })
})
