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

    describe('variables', function() {
	it('parses var', function() {
	    var p = tip.parse('var a')[0]
		.should.include({type: 'var', name: 'a'})
	})

	it('allows assinging vars', function() {
	    tip.parse('var a = 1')[0]
		.assingment
		.should.include({ type: 'number', value: '1' })
	})

    })

    describe('type expressions', function() {
	it('parses simple', function() {
	    tip.parse('var a : number')[0].typeExpression
		.should.eql({ constructor: 'number' })
	})

    })

    describe('literals', function() {
	it('parses float literals', function() {
	    tip.parse('30.01')[0].should.eql({ type: 'number', value: '30.01'})
	})

	it('parses string literals', function() {
	    tip.parse('"aa aa"')[0].should.eql({ type: 'string', value: 'aa aa'})
	})

	it('parses array constructor', function() {
	    tip.parse('[a, 2]')[0].should.eql({ type: 'array',
						value: [{ type: 'identifier', name: 'a' }
							, {type: 'number', value: '2'}
						       ]})
	})

	it('parses structures', function() {
	    tip.parse('{ a: 1}')[0]
		.should.eql({ type: 'struct'
			      , value: [ { key:  'a', value: { type: 'number', value: '1'}} ]})
	})

	it('parses structures with string keys', function() {
	    tip.parse('{ "aa": 1}')[0].value[0].key
		.should.eql("aa")
	})
    })



    describe('expressions', function() {
	it('parses operator expressions', function() {
	    tip.parse('a * b')[0].operation.should.eql('*')
	})
    })

    describe('interfaces', function() {
	it('parses class public interface', function() {
	    tip.parse('class A { public k }')[0].interfaces[0].visibility.should.eql('public')
	})

	it('parses class private interface', function() {
	    tip.parse('class A { k }')[0].interfaces[0].visibility.should.eql('private')
	})
    })
})
