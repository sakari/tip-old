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
    this.templates['function'] = handlebars.compile(
	fs.readFileSync('templates/function.js', 'utf8'))
}

Tip.prototype.parse = function(str) {
    return this._parser.parse(str + '\n')
}

Tip.prototype.compile = function(str) {
    var self = this
    var transpiled = this.parse(str).map(function(statement) {
	return self.transpileStatement(statement)
    }).join('\n')
    return transpiled
}

Tip.prototype.transpileStatement = function(ast) {
    if(ast.type === 'function') {
	return this.templates['function']({
	    name: ast.name,
	    parameters: ast.parameters.map(this.transpileParameter.bind(this)),
	    body: ast.body.map(this.transpileStatement.bind(this)),
	    type: ast.typeExpression
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
