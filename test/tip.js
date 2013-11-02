var should = require('should')
var fs = require('fs')

describe('tip', function() {
    var Tip = require('../src/tip')
    var tip
    beforeEach(function() {
	tip = new Tip()
    })
    it('parses the example file', function() {
	tip.parse(fs.readFileSync('example.tip', 'utf8'))
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

    describe('functions', function() {
	it('parses functions', function() {
	    tip.parse('fun(a) {}')[0]
		.should.eql({
		    type: 'function',
		    typeExpression: undefined,
		    parameters: [{ type: 'parameter', symbol: 'a', typeExpression: undefined}],
		    body: [],
		    name: 'fun'
		})
	})
    })

    describe('type expressions', function() {
	it('parses constructor', function() {
	    tip.parse('var a : number')[0].typeExpression
		.should.eql({
		    type: 'constructorType', constructor: 'number', args: []
		})
	})

	it('parses type expression with arguments', function() {
	    tip.parse('var a : k<p>')[0].typeExpression
		.should.eql({
		    type: 'constructorType',
		    constructor: 'k',
		    args: [{type: 'constructorType', constructor: 'p', args: []}]
		})
	})

	it('parses struct types', function() {
	    tip.parse('var a: { k : z }')[0].typeExpression
		.should.eql({ type: 'structType'
			      , fields: [{
				  key: 'k',
				  value: { type: 'constructorType', constructor: 'z', args: []}
			      }]})
	})

	it('parses function types', function() {
	    tip.parse('var a: (a) -> k')[0].typeExpression
		.should.eql(
		    { type: 'functionType'
		      , parameters: [{ type: 'constructorType', constructor: 'a', args: [] }]
		      , returnType: { type: 'constructorType', constructor: 'k', args: []}
		    })
	})

	it('parses type expressions in function parameters', function() {
	    tip.parse('fun(a:k) {}')[0].parameters[0].typeExpression
		.should.eql({ type: 'constructorType', constructor: 'k', args: []})
	})
    })

    describe('literals', function() {
	it('parses float literals', function() {
	    tip.parse('var a = 30.01')[0].assingment
		.should.eql({ type: 'number', value: '30.01'})
	})

	it('parses string literals', function() {
	    tip.parse('var k = "aa aa"')[0].assingment
		.should.eql({ type: 'string', value: 'aa aa'})
	})

	it('parses string literals with single quotes', function() {
	    tip.parse("'aa'")[0].value.should.eql('aa')
	})

	it('parses array constructor', function() {
	    tip.parse('var a = [a, 2]')[0].assingment
		.should.eql({ type: 'array',
			      value: [{ type: 'identifier', name: 'a' }
				      , {type: 'number', value: '2'}
				     ]})
	})

	it('parses structures', function() {
	    tip.parse('var a = { a: 1}')[0].assingment
		.should.eql({ type: 'struct'
			      , value: [ { key:  'a', value: { type: 'number', value: '1'}} ]})
	})

	it('parses structures with string keys', function() {
	    tip.parse('var a = { "aa": 1}')[0].assingment
		.value[0].key
		.should.eql("aa")
	})
    })

    describe('expressions', function() {
	it('parses operator expressions', function() {
	    tip.parse('var k = a * b')[0]
		.assingment
		.operation.should.eql('*')
	})

	it('parses index operators', function() {
	    tip.parse('var p = a[1]')[0].assingment
		.should.eql({
		    type: 'index',
		    lhs: { type: 'identifier', name: 'a' },
		    index: { type: 'number', value: '1'}
		})
	})

	it('parses identifier assingment', function() {
	    tip.parse('a = p')[0].rhs.name.should.eql('p')
	})

	it('can index expressions', function() {
	    tip.parse('var k = a[2][1]')[0].assingment.index.value.should.eql('1')
	})

	it('can call applications', function() {
	    tip.parse('a()()')[0]
		.callee.callee.name
		.should.eql('a')
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
