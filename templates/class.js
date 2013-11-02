function {{{name}}} () {
}

{{#each methods}}
{{{../name}}}.prototype.{{{name}}} = function({{{parameters}}}) {
    var _this = this
    {{{body}}}
}
{{/each}}
