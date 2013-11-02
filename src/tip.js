var peg = require('pegjs')
var fs = require('fs')
var fspath = require('path')
var handlebars = require('handlebars')

function Tip() {
    this._parser = peg.buildParser(
	fs.readFileSync(fspath.join(fspath.dirname(__filename), 'tip.peg')
			, 'utf8')
	, { trackLineAndColumn: true })

    this.templates = {}
    this.readTemplate('function')
    this.readTemplate('class')
}


Tip.prototype.readTemplate = function(template) {
    this.templates[template] = handlebars.compile(
	fs.readFileSync('templates/' + template + '.js', 'utf8'))
}

Tip.prototype.parse = function(str) {
    return this._parser.parse(str + '\n')
}

Tip.prototype.compile = function(str) {
    var self = this
    var transpiled = this.parse(str).map(function(statement) {
	return self.transpileStatement(statement)
    }).join('\n')
    console.log('>>>', transpiled)
    return transpiled
}

Tip.prototype.transpileStatement = function(ast) {
    var self = this
    if(ast.type === 'function') {
	return this.templates['function']({
	    name: ast.name,
	    parameters: ast.parameters.map(this.transpileParameter.bind(this)),
	    body: ast.body.map(this.transpileStatement.bind(this)),
	    type: ast.typeExpression
	})
    }

    if(ast.type === 'class') {
	return this.templates['class']({
	    name: ast.name,
	    methods: ast.interfaces.filter(function(i) {
		return i.interface.type === 'function'
	    }).map(function(i) {
		i = i.interface
		return {
		    name: i.name,
		    parameters: i.parameters.map(
			function(p) {
			    return p.symbol
			}).join(', '),
		    body: i.body.map(function(s) {
			return self.transpileStatement(s)
		    }).join('\n')
		}
	    })
	})
    }

    if(ast.type === 'return') {
	return 'return ' + this.transpileExpression(ast.value)
    }

    return this.transpileExpression(ast)
}

Tip.prototype.transpileExpression = function(ast) {
    if(!ast || ast === '' || ast === undefined )
	throw new Error('undefined ast: ' + JSON.stringify(ast, null, 4))

    if(ast.type === 'new') {
	return 'new ' + this.transpileExpression(ast.expression)
    }

    if(ast.type === 'identifier') {
	return ast.name
    }

    if(ast.type === 'number') {
	return ast.value
    }

    if(ast.type === 'operation') {
	return this.transpileExpression(ast.lhs) + ' ' +
	    ast.operation +
	    '  ' + this.transpileExpression(ast.rhs)
    }

    if(ast.type === 'application') {
	return this.transpileExpression(ast.callee) +
	    '(' +
	    ast.arguments.map(this.transpileExpression.bind(this)).join(', ')  +
	    ')'
    }

    throw new Error('unknown expression type ' + ast.type + ':"' + JSON.stringify(ast, null, 4) + '"')
}

Tip.prototype.transpileParameter = function(p) {
    return p.symbol
}

module.exports = Tip
