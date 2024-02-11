"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
function search(query, searchSpace) {
    if (!query)
        return [];
    var matcher = new RegExp("\\b".concat(query[0]), 'i');
    var remainingSearchSpace = searchSpace
        .reduce(function (acc, cur, i) {
        var match = matcher.exec(cur);
        if (!match)
            return acc;
        acc.push({
            index: i,
            matchIndexes: [match.index],
            decomposition: [query[0]]
        });
        return acc;
    }, []);
    if (!remainingSearchSpace.length)
        return [];
    var acceptedDecompositions = [[[query[0]], remainingSearchSpace]];
    var buildRegex = function (decomposition) {
        return new RegExp(decomposition.map(function (x) { return "\\b".concat(x); }).join('.*'), 'i');
    };
    var _loop_1 = function (letter) {
        var newDecompositions = [];
        var _loop_2 = function (decomposition, searchSpaceRemainder) {
            var checkDecomposition = function (decomp) {
                var regex = new RegExp(buildRegex(decomp));
                var copy = searchSpaceRemainder
                    .map(function (x) { return (__assign(__assign({}, x), { matchIndexes: __spreadArray([], x.matchIndexes, true) })); });
                var matches = copy
                    .filter(function (x) {
                    var match = regex.test(searchSpace[x.index]);
                    if (!match)
                        return false;
                    var newMatcher = new RegExp("\\b".concat(decomp.at(-1)), 'i');
                    var newMatch = newMatcher.exec(searchSpace[x.index]);
                    if (decomp.length > x.matchIndexes.length) {
                        x.matchIndexes.push(newMatch.index);
                    }
                    else {
                        x.matchIndexes[x.matchIndexes.length - 1] = newMatch.index;
                    }
                    return true;
                });
                console.log(decomp, matches.length, matches);
                if (matches.length) {
                    newDecompositions.push([decomp, matches]);
                }
            };
            checkDecomposition(__spreadArray(__spreadArray([], decomposition.slice(0, -1), true), [decomposition.at(-1) + letter], false));
            checkDecomposition(__spreadArray(__spreadArray([], decomposition, true), [letter], false));
        };
        for (var _b = 0, acceptedDecompositions_1 = acceptedDecompositions; _b < acceptedDecompositions_1.length; _b++) {
            var _c = acceptedDecompositions_1[_b], decomposition = _c[0], searchSpaceRemainder = _c[1];
            _loop_2(decomposition, searchSpaceRemainder);
        }
        if (!newDecompositions.length)
            return { value: [] };
        acceptedDecompositions = newDecompositions;
    };
    for (var _i = 0, _a = query.slice(1); _i < _a.length; _i++) {
        var letter = _a[_i];
        var state_1 = _loop_1(letter);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    console.log(JSON.stringify(acceptedDecompositions, null, 2));
    return acceptedDecompositions
        .map(function (_a) {
        var decomposition = _a[0], matches = _a[1];
        return matches.map(function (match) { return (__assign(__assign({}, match), { decomposition: decomposition })); });
    }).flat();
}
exports.search = search;
