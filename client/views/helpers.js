
// = equal to
Template.registerHelper('equalTo', function (a, b) {
    return a === b;
});

// != not equal to
Template.registerHelper('notEqualTo', function (a, b) {
    return a !== b;
});

// > greater than
Template.registerHelper('greaterThan', function (a, b) {
    return a > b;
});
Template.registerHelper('greaterThanOrEqualTo', function (a, b) {
    return a >= b;
});

// < less than
Template.registerHelper('lessThan', function (a, b) {
    return a < b;
});
Template.registerHelper('lessThanOrEqualTo', function (a, b) {
    return a <= b;
});

// && and
Template.registerHelper('and', function (a, b) {
    return a && b;
});
// || or
Template.registerHelper('and', function (a, b) {
    return a && b;
});

// Not
Template.registerHelper('not', function (a) {
    return !a;
});

// Nice time
Template.registerHelper('niceTime', function (t) {
    return moment(t).fromNow();
});