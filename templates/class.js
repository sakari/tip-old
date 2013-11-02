var {{{name}}} = (function() {
    function {{{name}}} ({{{constructorArgs}}}) {
	{{{constructorBody}}}
    }

    {{#each methods}}
    {{{../name}}}.prototype.{{{name}}} = function({{{parameters}}}) {
	var _this = this
	{{{body}}}
    }
    {{/each}}
    return {{{name}}}

})();
