'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// tslint:disable:ban-types
function isArrayLike(x) {
    return Array.isArray(x) || ArrayBuffer.isView(x);
}
function isComparable(x) {
    return typeof x.CompareTo === "function";
}
function isEquatable(x) {
    return typeof x.Equals === "function";
}
function isHashable(x) {
    return typeof x.GetHashCode === "function";
}
function sameConstructor(x, y) {
    return Object.getPrototypeOf(x).constructor === Object.getPrototypeOf(y).constructor;
}
function assertEqual(actual, expected, msg) {
    if (!equals(actual, expected)) {
        throw Object.assign(new Error(msg || `Expected: ${expected} - Actual: ${actual}`), {
            actual,
            expected,
        });
    }
}
function padWithZeros(i, length) {
    let str = i.toString(10);
    while (str.length < length) {
        str = "0" + str;
    }
    return str;
}
function dateOffset(date) {
    const date1 = date;
    return typeof date1.offset === "number"
        ? date1.offset
        : (date.kind === 1 /* UTC */
            ? 0 : date.getTimezoneOffset() * -60000);
}
function int32ToString(i, radix) {
    i = i < 0 && radix != null && radix !== 10 ? 0xFFFFFFFF + i + 1 : i;
    return i.toString(radix);
}
class ObjectRef {
    static id(o) {
        if (!ObjectRef.idMap.has(o)) {
            ObjectRef.idMap.set(o, ++ObjectRef.count);
        }
        return ObjectRef.idMap.get(o);
    }
}
ObjectRef.idMap = new WeakMap();
ObjectRef.count = 0;
function stringHash(s) {
    let i = 0;
    let h = 5381;
    const len = s.length;
    while (i < len) {
        h = (h * 33) ^ s.charCodeAt(i++);
    }
    return h;
}
function numberHash(x) {
    return x * 2654435761 | 0;
}
// From https://stackoverflow.com/a/37449594
function combineHashCodes(hashes) {
    if (hashes.length === 0) {
        return 0;
    }
    return hashes.reduce((h1, h2) => {
        return ((h1 << 5) + h1) ^ h2;
    });
}
function dateHash(x) {
    return x.getTime();
}
function arrayHash(x) {
    const len = x.length;
    const hashes = new Array(len);
    for (let i = 0; i < len; i++) {
        hashes[i] = structuralHash(x[i]);
    }
    return combineHashCodes(hashes);
}
function structuralHash(x) {
    if (x == null) {
        return 0;
    }
    switch (typeof x) {
        case "boolean":
            return x ? 1 : 0;
        case "number":
            return numberHash(x);
        case "string":
            return stringHash(x);
        default: {
            if (isHashable(x)) {
                return x.GetHashCode();
            }
            else if (isArrayLike(x)) {
                return arrayHash(x);
            }
            else if (x instanceof Date) {
                return dateHash(x);
            }
            else if (Object.getPrototypeOf(x).constructor === Object) {
                // TODO: check call-stack to prevent cyclic objects?
                const hashes = Object.values(x).map((v) => structuralHash(v));
                return combineHashCodes(hashes);
            }
            else {
                // Classes don't implement GetHashCode by default, but must use identity hashing
                return numberHash(ObjectRef.id(x));
                // return stringHash(String(x));
            }
        }
    }
}
function equalArraysWith(x, y, eq) {
    if (x == null) {
        return y == null;
    }
    if (y == null) {
        return false;
    }
    if (x.length !== y.length) {
        return false;
    }
    for (let i = 0; i < x.length; i++) {
        if (!eq(x[i], y[i])) {
            return false;
        }
    }
    return true;
}
function equalArrays(x, y) {
    return equalArraysWith(x, y, equals);
}
function equalObjects(x, y) {
    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y);
    if (xKeys.length !== yKeys.length) {
        return false;
    }
    xKeys.sort();
    yKeys.sort();
    for (let i = 0; i < xKeys.length; i++) {
        if (xKeys[i] !== yKeys[i] || !equals(x[xKeys[i]], y[yKeys[i]])) {
            return false;
        }
    }
    return true;
}
function equals(x, y) {
    if (x === y) {
        return true;
    }
    else if (x == null) {
        return y == null;
    }
    else if (y == null) {
        return false;
    }
    else if (typeof x !== "object") {
        return false;
    }
    else if (isEquatable(x)) {
        return x.Equals(y);
    }
    else if (isArrayLike(x)) {
        return isArrayLike(y) && equalArrays(x, y);
    }
    else if (x instanceof Date) {
        return (y instanceof Date) && compareDates(x, y) === 0;
    }
    else {
        return Object.getPrototypeOf(x).constructor === Object && equalObjects(x, y);
    }
}
function compareDates(x, y) {
    let xtime;
    let ytime;
    // DateTimeOffset and DateTime deals with equality differently.
    if ("offset" in x && "offset" in y) {
        xtime = x.getTime();
        ytime = y.getTime();
    }
    else {
        xtime = x.getTime() + dateOffset(x);
        ytime = y.getTime() + dateOffset(y);
    }
    return xtime === ytime ? 0 : (xtime < ytime ? -1 : 1);
}
function compareArraysWith(x, y, comp) {
    if (x == null) {
        return y == null ? 0 : 1;
    }
    if (y == null) {
        return -1;
    }
    if (x.length !== y.length) {
        return x.length < y.length ? -1 : 1;
    }
    for (let i = 0, j = 0; i < x.length; i++) {
        j = comp(x[i], y[i]);
        if (j !== 0) {
            return j;
        }
    }
    return 0;
}
function compareArrays(x, y) {
    return compareArraysWith(x, y, compare);
}
function compareObjects(x, y) {
    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y);
    if (xKeys.length !== yKeys.length) {
        return xKeys.length < yKeys.length ? -1 : 1;
    }
    xKeys.sort();
    yKeys.sort();
    for (let i = 0, j = 0; i < xKeys.length; i++) {
        const key = xKeys[i];
        if (key !== yKeys[i]) {
            return key < yKeys[i] ? -1 : 1;
        }
        else {
            j = compare(x[key], y[key]);
            if (j !== 0) {
                return j;
            }
        }
    }
    return 0;
}
function compare(x, y) {
    if (x === y) {
        return 0;
    }
    else if (x == null) {
        return y == null ? 0 : -1;
    }
    else if (y == null) {
        return 1;
    }
    else if (typeof x !== "object") {
        return x < y ? -1 : 1;
    }
    else if (isComparable(x)) {
        return x.CompareTo(y);
    }
    else if (isArrayLike(x)) {
        return isArrayLike(y) ? compareArrays(x, y) : -1;
    }
    else if (x instanceof Date) {
        return y instanceof Date ? compareDates(x, y) : -1;
    }
    else {
        return Object.getPrototypeOf(x).constructor === Object ? compareObjects(x, y) : -1;
    }
}
// ICollection.Clear and Count members can be called on Arrays
// or Dictionaries so we need a runtime check (see #1120)
function count(col) {
    if (isArrayLike(col)) {
        return col.length;
    }
    else {
        let count = 0;
        for (const _ of col) {
            count++;
        }
        return count;
    }
}

function seqToString(self) {
    let count = 0;
    let str = "[";
    for (const x of self) {
        if (count === 0) {
            str += toString(x);
        }
        else if (count === 100) {
            str += "; ...";
            break;
        }
        else {
            str += "; " + toString(x);
        }
        count++;
    }
    return str + "]";
}
function toString(x, callStack = 0) {
    if (x != null && typeof x === "object") {
        if (typeof x.toString === "function") {
            return x.toString();
        }
        else if (Symbol.iterator in x) {
            return seqToString(x);
        }
        else { // TODO: Date?
            const cons = Object.getPrototypeOf(x).constructor;
            return cons === Object && callStack < 10
                // Same format as recordToString
                ? "{ " + Object.entries(x).map(([k, v]) => k + " = " + toString(v, callStack + 1)).join("\n  ") + " }"
                : cons.name;
        }
    }
    return String(x);
}
function compareList(self, other) {
    if (self === other) {
        return 0;
    }
    else {
        if (other == null) {
            return -1;
        }
        while (self.tail != null) {
            if (other.tail == null) {
                return 1;
            }
            const res = compare(self.head, other.head);
            if (res !== 0) {
                return res;
            }
            self = self.tail;
            other = other.tail;
        }
        return other.tail == null ? 0 : -1;
    }
}
class List {
    constructor(head, tail) {
        this.head = head;
        this.tail = tail;
    }
    [Symbol.iterator]() {
        let cur = this;
        return {
            next: () => {
                const value = cur === null || cur === void 0 ? void 0 : cur.head;
                const done = (cur === null || cur === void 0 ? void 0 : cur.tail) == null;
                cur = cur === null || cur === void 0 ? void 0 : cur.tail;
                return { done, value };
            },
        };
    }
    toJSON() { return Array.from(this); }
    toString() { return seqToString(this); }
    GetHashCode() { return combineHashCodes(Array.from(this).map(structuralHash)); }
    Equals(other) { return compareList(this, other) === 0; }
    CompareTo(other) { return compareList(this, other); }
}
class Union {
    get name() {
        return this.cases()[this.tag];
    }
    toJSON() {
        return this.fields.length === 0 ? this.name : [this.name].concat(this.fields);
    }
    toString() {
        if (this.fields.length === 0) {
            return this.name;
        }
        else {
            let fields = "";
            let withParens = true;
            if (this.fields.length === 1) {
                const field = toString(this.fields[0]);
                withParens = field.indexOf(" ") >= 0;
                fields = field;
            }
            else {
                fields = this.fields.map((x) => toString(x)).join(", ");
            }
            return this.name + (withParens ? " (" : " ") + fields + (withParens ? ")" : "");
        }
    }
    GetHashCode() {
        const hashes = this.fields.map((x) => structuralHash(x));
        hashes.splice(0, 0, numberHash(this.tag));
        return combineHashCodes(hashes);
    }
    Equals(other) {
        if (this === other) {
            return true;
        }
        else if (!sameConstructor(this, other)) {
            return false;
        }
        else if (this.tag === other.tag) {
            return equalArrays(this.fields, other.fields);
        }
        else {
            return false;
        }
    }
    CompareTo(other) {
        if (this === other) {
            return 0;
        }
        else if (!sameConstructor(this, other)) {
            return -1;
        }
        else if (this.tag === other.tag) {
            return compareArrays(this.fields, other.fields);
        }
        else {
            return this.tag < other.tag ? -1 : 1;
        }
    }
}
function recordToJSON(self) {
    const o = {};
    const keys = Object.keys(self);
    for (let i = 0; i < keys.length; i++) {
        o[keys[i]] = self[keys[i]];
    }
    return o;
}
function recordToString(self) {
    return "{ " + Object.entries(self).map(([k, v]) => k + " = " + toString(v)).join("\n  ") + " }";
}
function recordGetHashCode(self) {
    const hashes = Object.values(self).map((v) => structuralHash(v));
    return combineHashCodes(hashes);
}
function recordEquals(self, other) {
    if (self === other) {
        return true;
    }
    else if (!sameConstructor(self, other)) {
        return false;
    }
    else {
        const thisNames = Object.keys(self);
        for (let i = 0; i < thisNames.length; i++) {
            if (!equals(self[thisNames[i]], other[thisNames[i]])) {
                return false;
            }
        }
        return true;
    }
}
function recordCompareTo(self, other) {
    if (self === other) {
        return 0;
    }
    else if (!sameConstructor(self, other)) {
        return -1;
    }
    else {
        const thisNames = Object.keys(self);
        for (let i = 0; i < thisNames.length; i++) {
            const result = compare(self[thisNames[i]], other[thisNames[i]]);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    }
}
class Record {
    toJSON() { return recordToJSON(this); }
    toString() { return recordToString(this); }
    GetHashCode() { return recordGetHashCode(this); }
    Equals(other) { return recordEquals(this, other); }
    CompareTo(other) { return recordCompareTo(this, other); }
}

class TypeInfo {
    constructor(fullname, generics, construct, parent, fields, cases, enumCases) {
        this.fullname = fullname;
        this.generics = generics;
        this.construct = construct;
        this.parent = parent;
        this.fields = fields;
        this.cases = cases;
        this.enumCases = enumCases;
    }
    toString() {
        return fullName(this);
    }
    GetHashCode() {
        return getHashCode(this);
    }
    Equals(other) {
        return equals$1(this, other);
    }
}
function getGenerics(t) {
    return t.generics != null ? t.generics : [];
}
function getHashCode(t) {
    const fullnameHash = stringHash(t.fullname);
    const genHashes = getGenerics(t).map(getHashCode);
    return combineHashCodes([fullnameHash, ...genHashes]);
}
function equals$1(t1, t2) {
    if (t1.fullname === "") { // Anonymous records
        return t2.fullname === ""
            && equalArraysWith(getRecordElements(t1), getRecordElements(t2), ([k1, v1], [k2, v2]) => k1 === k2 && equals$1(v1, v2));
    }
    else {
        return t1.fullname === t2.fullname
            && equalArraysWith(getGenerics(t1), getGenerics(t2), equals$1);
    }
}
function class_type(fullname, generics, construct, parent) {
    return new TypeInfo(fullname, generics, construct, parent);
}
const string_type = new TypeInfo("System.String");
const bool_type = new TypeInfo("System.Boolean");
const int32_type = new TypeInfo("System.Int32");
const float64_type = new TypeInfo("System.Double");
function fullName(t) {
    const gen = t.generics != null && !isArray(t) ? t.generics : [];
    if (gen.length > 0) {
        return t.fullname + "[" + gen.map((x) => fullName(x)).join(",") + "]";
    }
    else {
        return t.fullname;
    }
}
function isArray(t) {
    return t.fullname.endsWith("[]");
}
function getRecordElements(t) {
    if (t.fields != null) {
        return t.fields();
    }
    else {
        throw new Error(`${t.fullname} is not an F# record type`);
    }
}

// Using a class here for better compatibility with TS files importing Some
class Some {
    constructor(value) {
        this.value = value;
    }
    toJSON() {
        return this.value;
    }
    // Don't add "Some" for consistency with erased options
    toString() {
        return String(this.value);
    }
    GetHashCode() {
        return structuralHash(this.value);
    }
    Equals(other) {
        if (other == null) {
            return false;
        }
        else {
            return equals(this.value, other instanceof Some ? other.value : other);
        }
    }
    CompareTo(other) {
        if (other == null) {
            return 1;
        }
        else {
            return compare(this.value, other instanceof Some ? other.value : other);
        }
    }
}
function value(x) {
    if (x == null) {
        throw new Error("Option has no value");
    }
    else {
        return x instanceof Some ? x.value : x;
    }
}

// https://github.com/MikeMcl/big.js/blob/01b3ce3a6b0ba7b42442ea48ec4ffc88d1669ec4/big.mjs
// The shared prototype object.
var P = {
    GetHashCode() { return combineHashCodes([this.s, this.e].concat(this.c)); },
    Equals(x) { return !this.cmp(x); },
    CompareTo(x) { return this.cmp(x); },
};
/*
 *  big.js v5.2.2
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  Copyright (c) 2018 Michael Mclaughlin <M8ch88l@gmail.com>
 *  https://github.com/MikeMcl/big.js/LICENCE
 */
/************************************** EDITABLE DEFAULTS *****************************************/
// The default values below must be integers within the stated ranges.
/*
 * The maximum number of decimal places (DP) of the results of operations involving division:
 * div and sqrt, and pow with negative exponents.
 */
var DP = 28, // 0 to MAX_DP
/*
 * The rounding mode (RM) used when rounding to the above decimal places.
 *
 *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
 *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
 *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
 *  3  Away from zero.                                  (ROUND_UP)
 */
RM = 1, // 0, 1, 2 or 3
// The maximum value of DP and Big.DP.
MAX_DP = 1E6, // 0 to 1000000
// The maximum magnitude of the exponent argument to the pow method.
MAX_POWER = 1E6, // 1 to 1000000
/*
 * The negative exponent (NE) at and beneath which toString returns exponential notation.
 * (JavaScript numbers: -7)
 * -1000000 is the minimum recommended exponent value of a Big.
 */
NE = -29, // 0 to -1000000
/*
 * The positive exponent (PE) at and above which toString returns exponential notation.
 * (JavaScript numbers: 21)
 * 1000000 is the maximum recommended exponent value of a Big.
 * (This limit is not enforced or checked.)
 */
PE = 29, // 0 to 1000000
/**************************************************************************************************/
// Error messages.
NAME = '[big.js] ', INVALID = NAME + 'Invalid ', INVALID_DP = INVALID + 'decimal places', INVALID_RM = INVALID + 'rounding mode', DIV_BY_ZERO = NAME + 'Division by zero', UNDEFINED = void 0, NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
/*
 * Create and return a Big constructor.
 *
 */
function _Big_() {
    /*
     * The Big constructor and exported function.
     * Create and return a new instance of a Big number object.
     *
     * n {number|string|Big} A numeric value.
     */
    function Big(n) {
        var x = this;
        // Enable constructor usage without new.
        if (!(x instanceof Big))
            return n === UNDEFINED ? _Big_() : new Big(n);
        // Duplicate.
        if (n instanceof Big) {
            x.s = n.s;
            x.e = n.e;
            x.c = n.c.slice();
            normalize(x);
        }
        else {
            parse(x, n);
        }
        /*
         * Retain a reference to this Big constructor, and shadow Big.prototype.constructor which
         * points to Object.
         */
        x.constructor = Big;
    }
    Big.prototype = P;
    Big.DP = DP;
    Big.RM = RM;
    Big.NE = NE;
    Big.PE = PE;
    Big.version = '5.2.2';
    return Big;
}
function normalize(x) {
    x = round(x, DP, 0);
    if (x.c.length > 1 && !x.c[0]) {
        let i = x.c.findIndex(x => x);
        x.c = x.c.slice(i);
        x.e = x.e - i;
    }
}
/*
 * Parse the number or string value passed to a Big constructor.
 *
 * x {Big} A Big number instance.
 * n {number|string} A numeric value.
 */
function parse(x, n) {
    var e, i, nl;
    // Minus zero?
    if (n === 0 && 1 / n < 0)
        n = '-0';
    else if (!NUMERIC.test(n += ''))
        throw Error(INVALID + 'number');
    // Determine sign.
    x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;
    // Decimal point?
    if ((e = n.indexOf('.')) > -1)
        n = n.replace('.', '');
    // Exponential form?
    if ((i = n.search(/e/i)) > 0) {
        // Determine exponent.
        if (e < 0)
            e = i;
        e += +n.slice(i + 1);
        n = n.substring(0, i);
    }
    else if (e < 0) {
        // Integer.
        e = n.length;
    }
    nl = n.length;
    // Determine leading zeros before decimal point.
    for (i = 0; i < e && i < nl && n.charAt(i) == '0';)
        ++i;
    // older version (ignores decimal point).
    // // Determine leading zeros.
    // for (i = 0; i < nl && n.charAt(i) == '0';) ++i;
    if (i == nl) {
        // Zero.
        x.c = [x.e = 0];
    }
    else {
        x.e = e - i - 1;
        x.c = [];
        // Convert string to array of digits without leading zeros
        for (e = 0; i < nl;)
            x.c[e++] = +n.charAt(i++);
        // older version (doesn't keep trailing zeroes).
        // // Determine trailing zeros.
        // for (; nl > 0 && n.charAt(--nl) == '0';);
        // // Convert string to array of digits without leading/trailing zeros.
        // for (e = 0; i <= nl;) x.c[e++] = +n.charAt(i++);
    }
    x = round(x, Big.DP, Big.RM);
    return x;
}
/*
 * Round Big x to a maximum of dp decimal places using rounding mode rm.
 * Called by stringify, P.div, P.round and P.sqrt.
 *
 * x {Big} The Big to round.
 * dp {number} Integer, 0 to MAX_DP inclusive.
 * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
 * [more] {boolean} Whether the result of division was truncated.
 */
function round(x, dp, rm, more) {
    var xc = x.c, i = x.e + dp + 1;
    if (i < xc.length) {
        if (rm === 1) {
            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        }
        else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
                (more || i < 0 || xc[i + 1] !== UNDEFINED || xc[i - 1] & 1);
        }
        else if (rm === 3) {
            more = more || !!xc[0];
        }
        else {
            more = false;
            if (rm !== 0)
                throw Error(INVALID_RM);
        }
        if (i < 1) {
            xc.length = 1;
            if (more) {
                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                xc[0] = 1;
            }
            else {
                // Zero.
                xc[0] = x.e = 0;
            }
        }
        else {
            // Remove any digits after the required decimal places.
            xc.length = i--;
            // Round up?
            if (more) {
                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;
                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }
            // Remove trailing zeros.
            for (i = xc.length; !xc[--i];)
                xc.pop();
        }
    }
    else if (rm < 0 || rm > 3 || rm !== ~~rm) {
        throw Error(INVALID_RM);
    }
    return x;
}
/*
 * Return a string representing the value of Big x in normal or exponential notation.
 * Handles P.toExponential, P.toFixed, P.toJSON, P.toPrecision, P.toString and P.valueOf.
 *
 * x {Big}
 * id? {number} Caller id.
 *         1 toExponential
 *         2 toFixed
 *         3 toPrecision
 *         4 valueOf
 * n? {number|undefined} Caller's argument.
 * k? {number|undefined}
 */
function stringify(x, id, n, k) {
    var e, s, Big = x.constructor, z = !x.c[0];
    if (n !== UNDEFINED) {
        if (n !== ~~n || n < (id == 3) || n > MAX_DP) {
            throw Error(id == 3 ? INVALID + 'precision' : INVALID_DP);
        }
        x = new Big(x);
        // The index of the digit that may be rounded up.
        n = k - x.e;
        // Round?
        if (x.c.length > ++k)
            round(x, n, Big.RM);
        // toFixed: recalculate k as x.e may have changed if value rounded up.
        if (id == 2)
            k = x.e + n + 1;
        // Append zeros?
        for (; x.c.length < k;)
            x.c.push(0);
    }
    e = x.e;
    s = x.c.join('');
    n = s.length;
    // Exponential notation?
    if (id != 2 && (id == 1 || id == 3 && k <= e || e <= Big.NE || e >= Big.PE)) {
        s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;
        // Normal notation.
    }
    else if (e < 0) {
        for (; ++e;)
            s = '0' + s;
        s = '0.' + s;
    }
    else if (e > 0) {
        if (++e > n)
            for (e -= n; e--;)
                s += '0';
        else if (e < n)
            s = s.slice(0, e) + '.' + s.slice(e);
    }
    else if (n > 1) {
        s = s.charAt(0) + '.' + s.slice(1);
    }
    return x.s < 0 && (!z || id == 4) ? '-' + s : s;
}
// Prototype/instance methods
/*
 * Return a new Big whose value is the absolute value of this Big.
 */
P.abs = function () {
    var x = new this.constructor(this);
    x.s = 1;
    return x;
};
/*
 * Return 1 if the value of this Big is greater than the value of Big y,
 *       -1 if the value of this Big is less than the value of Big y, or
 *        0 if they have the same value.
*/
P.cmp = function (y) {
    var isneg, Big = this.constructor, x = new Big(this), y = new Big(y), xc = x.c, yc = y.c, i = x.s, j = y.s, k = x.e, l = y.e;
    // Either zero?
    if (!xc[0] || !yc[0])
        return !xc[0] ? !yc[0] ? 0 : -j : i;
    // Signs differ?
    if (i != j)
        return i;
    isneg = i < 0;
    // Compare exponents.
    if (k != l)
        return k > l ^ isneg ? 1 : -1;
    // Compare digit by digit.
    j = Math.max(xc.length, yc.length);
    for (i = 0; i < j; i++) {
        k = i < xc.length ? xc[i] : 0;
        l = i < yc.length ? yc[i] : 0;
        if (k != l)
            return k > l ^ isneg ? 1 : -1;
    }
    return 0;
    // old version (doesn't compare well trailing zeroes, e.g. 1.0 with 1.00)
    // j = (k = xc.length) < (l = yc.length) ? k : l;
    // // Compare digit by digit.
    // for (i = -1; ++i < j;) {
    //   if (xc[i] != yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
    // }
    // // Compare lengths.
    // return k == l ? 0 : k > l ^ isneg ? 1 : -1;
};
/*
 * Return a new Big whose value is the value of this Big divided by the value of Big y, rounded,
 * if necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
 */
P.div = function (y) {
    var Big = this.constructor, x = new Big(this), y = new Big(y), a = x.c, // dividend
    b = y.c, // divisor
    k = x.s == y.s ? 1 : -1, dp = Big.DP;
    if (dp !== ~~dp || dp < 0 || dp > MAX_DP)
        throw Error(INVALID_DP);
    // Divisor is zero?
    if (!b[0])
        throw Error(DIV_BY_ZERO);
    // Dividend is 0? Return +-0.
    if (!a[0])
        return new Big(k * 0);
    var bl, bt, n, cmp, ri, bz = b.slice(), ai = bl = b.length, al = a.length, r = a.slice(0, bl), // remainder
    rl = r.length, q = y, // quotient
    qc = q.c = [], qi = 0, d = dp + (q.e = x.e - y.e) + 1; // number of digits of the result
    q.s = k;
    k = d < 0 ? 0 : d;
    // Create version of divisor with leading zero.
    bz.unshift(0);
    // Add zeros to make remainder as long as divisor.
    for (; rl++ < bl;)
        r.push(0);
    do {
        // n is how many times the divisor goes into current remainder.
        for (n = 0; n < 10; n++) {
            // Compare divisor and remainder.
            if (bl != (rl = r.length)) {
                cmp = bl > rl ? 1 : -1;
            }
            else {
                for (ri = -1, cmp = 0; ++ri < bl;) {
                    if (b[ri] != r[ri]) {
                        cmp = b[ri] > r[ri] ? 1 : -1;
                        break;
                    }
                }
            }
            // If divisor < remainder, subtract divisor from remainder.
            if (cmp < 0) {
                // Remainder can't be more than 1 digit longer than divisor.
                // Equalise lengths using divisor with extra leading zero?
                for (bt = rl == bl ? b : bz; rl;) {
                    if (r[--rl] < bt[rl]) {
                        ri = rl;
                        for (; ri && !r[--ri];)
                            r[ri] = 9;
                        --r[ri];
                        r[rl] += 10;
                    }
                    r[rl] -= bt[rl];
                }
                for (; !r[0];)
                    r.shift();
            }
            else {
                break;
            }
        }
        // Add the digit n to the result array.
        qc[qi++] = cmp ? n : ++n;
        // Update the remainder.
        if (r[0] && cmp)
            r[rl] = a[ai] || 0;
        else
            r = [a[ai]];
    } while ((ai++ < al || r[0] !== UNDEFINED) && k--);
    // Leading zero? Do not remove if result is simply zero (qi == 1).
    if (!qc[0] && qi != 1) {
        // There can't be more than one zero.
        qc.shift();
        q.e--;
    }
    // Round?
    if (qi > d)
        round(q, dp, Big.RM, r[0] !== UNDEFINED);
    return q;
};
/*
 * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
 */
P.eq = function (y) {
    return !this.cmp(y);
};
/*
 * Return true if the value of this Big is greater than the value of Big y, otherwise return
 * false.
 */
P.gt = function (y) {
    return this.cmp(y) > 0;
};
/*
 * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
 * return false.
 */
P.gte = function (y) {
    return this.cmp(y) > -1;
};
/*
 * Return true if the value of this Big is less than the value of Big y, otherwise return false.
 */
P.lt = function (y) {
    return this.cmp(y) < 0;
};
/*
 * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
 * return false.
 */
P.lte = function (y) {
    return this.cmp(y) < 1;
};
/*
 * Return a new Big whose value is the value of this Big minus the value of Big y.
 */
P.minus = P.sub = function (y) {
    var i, j, t, xlty, Big = this.constructor, x = new Big(this), y = new Big(y), a = x.s, b = y.s;
    // Signs differ?
    if (a != b) {
        y.s = -b;
        return x.plus(y);
    }
    var xc = x.c.slice(), xe = x.e, yc = y.c, ye = y.e;
    // Either zero?
    if (!xc[0] || !yc[0]) {
        // y is non-zero? x is non-zero? Or both are zero.
        return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
    }
    // Determine which is the bigger number. Prepend zeros to equalise exponents.
    if (a = xe - ye) {
        if (xlty = a < 0) {
            a = -a;
            t = xc;
        }
        else {
            ye = xe;
            t = yc;
        }
        t.reverse();
        for (b = a; b--;)
            t.push(0);
        t.reverse();
    }
    else {
        // Exponents equal. Check digit by digit.
        j = ((xlty = xc.length < yc.length) ? xc : yc).length;
        for (a = b = 0; b < j; b++) {
            if (xc[b] != yc[b]) {
                xlty = xc[b] < yc[b];
                break;
            }
        }
    }
    // x < y? Point xc to the array of the bigger number.
    if (xlty) {
        t = xc;
        xc = yc;
        yc = t;
        y.s = -y.s;
    }
    /*
     * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
     * needs to start at yc.length.
     */
    if ((b = (j = yc.length) - (i = xc.length)) > 0)
        for (; b--;)
            xc[i++] = 0;
    // Subtract yc from xc.
    for (b = i; j > a;) {
        if (xc[--j] < yc[j]) {
            for (i = j; i && !xc[--i];)
                xc[i] = 9;
            --xc[i];
            xc[j] += 10;
        }
        xc[j] -= yc[j];
    }
    // Remove trailing zeros.
    for (; xc[--b] === 0;)
        xc.pop();
    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] === 0;) {
        xc.shift();
        --ye;
    }
    if (!xc[0]) {
        // n - n = +0
        y.s = 1;
        // Result must be zero.
        xc = [ye = 0];
    }
    y.c = xc;
    y.e = ye;
    return y;
};
/*
 * Return a new Big whose value is the value of this Big modulo the value of Big y.
 */
P.mod = function (y) {
    var ygtx, Big = this.constructor, x = new Big(this), y = new Big(y), a = x.s, b = y.s;
    if (!y.c[0])
        throw Error(DIV_BY_ZERO);
    x.s = y.s = 1;
    ygtx = y.cmp(x) == 1;
    x.s = a;
    y.s = b;
    if (ygtx)
        return new Big(x);
    a = Big.DP;
    b = Big.RM;
    Big.DP = Big.RM = 0;
    x = x.div(y);
    Big.DP = a;
    Big.RM = b;
    return this.minus(x.times(y));
};
/*
 * Return a new Big whose value is the value of this Big plus the value of Big y.
 */
P.plus = P.add = function (y) {
    var t, Big = this.constructor, x = new Big(this), y = new Big(y), a = x.s, b = y.s;
    // Signs differ?
    if (a != b) {
        y.s = -b;
        return x.minus(y);
    }
    var xe = x.e, xc = x.c, ye = y.e, yc = y.c;
    // Either zero? y is non-zero? x is non-zero? Or both are zero.
    if (!xc[0] || !yc[0])
        return yc[0] ? y : new Big(xc[0] ? x : a * 0);
    xc = xc.slice();
    // Prepend zeros to equalise exponents.
    // Note: reverse faster than unshifts.
    if (a = xe - ye) {
        if (a > 0) {
            ye = xe;
            t = yc;
        }
        else {
            a = -a;
            t = xc;
        }
        t.reverse();
        for (; a--;)
            t.push(0);
        t.reverse();
    }
    // Point xc to the longer array.
    if (xc.length - yc.length < 0) {
        t = yc;
        yc = xc;
        xc = t;
    }
    a = yc.length;
    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
    for (b = 0; a; xc[a] %= 10)
        b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    if (b) {
        xc.unshift(b);
        ++ye;
    }
    // Remove trailing zeros.
    for (a = xc.length; xc[--a] === 0;)
        xc.pop();
    y.c = xc;
    y.e = ye;
    return y;
};
/*
 * Return a Big whose value is the value of this Big raised to the power n.
 * If n is negative, round to a maximum of Big.DP decimal places using rounding
 * mode Big.RM.
 *
 * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
 */
P.pow = function (n) {
    var Big = this.constructor, x = new Big(this), y = new Big(1), one = new Big(1), isneg = n < 0;
    if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER)
        throw Error(INVALID + 'exponent');
    if (isneg)
        n = -n;
    for (;;) {
        if (n & 1)
            y = y.times(x);
        n >>= 1;
        if (!n)
            break;
        x = x.times(x);
    }
    return isneg ? one.div(y) : y;
};
/*
 * Return a new Big whose value is the value of this Big rounded using rounding mode rm
 * to a maximum of dp decimal places, or, if dp is negative, to an integer which is a
 * multiple of 10**-dp.
 * If dp is not specified, round to 0 decimal places.
 * If rm is not specified, use Big.RM.
 *
 * dp? {number} Integer, -MAX_DP to MAX_DP inclusive.
 * rm? 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
 */
P.round = function (dp, rm) {
    var Big = this.constructor;
    if (dp === UNDEFINED)
        dp = 0;
    else if (dp !== ~~dp || dp < -MAX_DP || dp > MAX_DP)
        throw Error(INVALID_DP);
    return round(new Big(this), dp, rm === UNDEFINED ? Big.RM : rm);
};
/*
 * Return a new Big whose value is the square root of the value of this Big, rounded, if
 * necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
 */
P.sqrt = function () {
    var r, c, t, Big = this.constructor, x = new Big(this), s = x.s, e = x.e, half = new Big(0.5);
    // Zero?
    if (!x.c[0])
        return new Big(x);
    // Negative?
    if (s < 0)
        throw Error(NAME + 'No square root');
    // Estimate.
    s = Math.sqrt(x + '');
    // Math.sqrt underflow/overflow?
    // Re-estimate: pass x coefficient to Math.sqrt as integer, then adjust the result exponent.
    if (s === 0 || s === 1 / 0) {
        c = x.c.join('');
        if (!(c.length + e & 1))
            c += '0';
        s = Math.sqrt(c);
        e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        r = new Big((s == 1 / 0 ? '1e' : (s = s.toExponential()).slice(0, s.indexOf('e') + 1)) + e);
    }
    else {
        r = new Big(s);
    }
    e = r.e + (Big.DP += 4);
    // Newton-Raphson iteration.
    do {
        t = r;
        r = half.times(t.plus(x.div(t)));
    } while (t.c.slice(0, e).join('') !== r.c.slice(0, e).join(''));
    return round(r, Big.DP -= 4, Big.RM);
};
/*
 * Return a new Big whose value is the value of this Big times the value of Big y.
 */
P.times = P.mul = function (y) {
    var c, Big = this.constructor, x = new Big(this), y = new Big(y), xc = x.c, yc = y.c, a = xc.length, b = yc.length, i = x.e, j = y.e;
    // Determine sign of result.
    y.s = x.s == y.s ? 1 : -1;
    // Return signed 0 if either 0.
    if (!xc[0] || !yc[0])
        return new Big(y.s * 0);
    // Initialise exponent of result as x.e + y.e.
    y.e = i + j;
    // If array xc has fewer digits than yc, swap xc and yc, and lengths.
    if (a < b) {
        c = xc;
        xc = yc;
        yc = c;
        j = a;
        a = b;
        b = j;
    }
    // Initialise coefficient array of result with zeros.
    for (c = new Array(j = a + b); j--;)
        c[j] = 0;
    // Multiply.
    // i is initially xc.length.
    for (i = b; i--;) {
        b = 0;
        // a is yc.length.
        for (j = a + i; j > i;) {
            // Current sum of products at this digit position, plus carry.
            b = c[j] + yc[i] * xc[j - i - 1] + b;
            c[j--] = b % 10;
            // carry
            b = b / 10 | 0;
        }
        c[j] = (c[j] + b) % 10;
    }
    // Increment result exponent if there is a final carry, otherwise remove leading zero.
    if (b)
        ++y.e;
    else
        c.shift();
    // Remove trailing zeros.
    for (i = c.length; !c[--i];)
        c.pop();
    y.c = c;
    return y;
};
/*
 * Return a string representing the value of this Big in exponential notation to dp fixed decimal
 * places and rounded using Big.RM.
 *
 * dp? {number} Integer, 0 to MAX_DP inclusive.
 */
P.toExponential = function (dp) {
    return stringify(this, 1, dp, dp);
};
/*
 * Return a string representing the value of this Big in normal notation to dp fixed decimal
 * places and rounded using Big.RM.
 *
 * dp? {number} Integer, 0 to MAX_DP inclusive.
 *
 * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
 * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
 */
P.toFixed = function (dp) {
    return stringify(this, 2, dp, this.e + dp);
};
/*
 * Return a string representing the value of this Big rounded to sd significant digits using
 * Big.RM. Use exponential notation if sd is less than the number of digits necessary to represent
 * the integer part of the value in normal notation.
 *
 * sd {number} Integer, 1 to MAX_DP inclusive.
 */
P.toPrecision = function (sd) {
    return stringify(this, 3, sd, sd - 1);
};
/*
 * Return a string representing the value of this Big.
 * Return exponential notation if this Big has a positive exponent equal to or greater than
 * Big.PE, or a negative exponent equal to or less than Big.NE.
 * Omit the sign for negative zero.
 */
P.toString = function () {
    return stringify(this);
};
/*
 * Return a string representing the value of this Big.
 * Return exponential notation if this Big has a positive exponent equal to or greater than
 * Big.PE, or a negative exponent equal to or less than Big.NE.
 * Include the sign for negative zero.
 */
P.valueOf = P.toJSON = function () {
    return stringify(this, 4);
};
// Export
var Big = _Big_();

const get_Zero = new Big(0);
const get_One = new Big(1);
const get_MinusOne = new Big(-1);
const get_MaxValue = new Big("79228162514264337593543950335");
const get_MinValue = new Big("-79228162514264337593543950335");

// export type decimal = Decimal;
var NumberStyles;
(function (NumberStyles) {
    // None = 0x00000000,
    // AllowLeadingWhite = 0x00000001,
    // AllowTrailingWhite = 0x00000002,
    // AllowLeadingSign = 0x00000004,
    // AllowTrailingSign = 0x00000008,
    // AllowParentheses = 0x00000010,
    // AllowDecimalPoint = 0x00000020,
    // AllowThousands = 0x00000040,
    // AllowExponent = 0x00000080,
    // AllowCurrencySymbol = 0x00000100,
    NumberStyles[NumberStyles["AllowHexSpecifier"] = 512] = "AllowHexSpecifier";
    // Integer = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign,
    // HexNumber = AllowLeadingWhite | AllowTrailingWhite | AllowHexSpecifier,
    // Number = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign |
    //          AllowTrailingSign | AllowDecimalPoint | AllowThousands,
    // Float = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign |
    //         AllowDecimalPoint | AllowExponent,
    // Currency = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign | AllowTrailingSign |
    //            AllowParentheses | AllowDecimalPoint | AllowThousands | AllowCurrencySymbol,
    // Any = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign | AllowTrailingSign |
    //       AllowParentheses | AllowDecimalPoint | AllowThousands | AllowCurrencySymbol | AllowExponent,
})(NumberStyles || (NumberStyles = {}));

// Adapted from: https://github.com/dcodeIO/long.js/blob/master/src/long.js
/**
 * wasm optimizations, to do native i64 multiplication and divide
 */
var wasm = null;
try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11
    ])), {}).exports;
}
catch (e) {
    // no wasm support :(
}
/**
 * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
 *  See the from* functions below for more convenient ways of constructing Longs.
 * @exports Long
 * @class A Long class for representing a 64 bit two's-complement integer value.
 * @param {number} low The low (signed) 32 bits of the long
 * @param {number} high The high (signed) 32 bits of the long
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @constructor
 */
function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     */
    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     */
    this.unsigned = !!unsigned;
}
Long.prototype.GetHashCode = function () {
    let h1 = this.unsigned ? 1 : 0;
    h1 = ((h1 << 5) + h1) ^ this.high;
    h1 = ((h1 << 5) + h1) ^ this.low;
    return h1;
};
Long.prototype.Equals = function (x) { return equals$2(this, x); };
Long.prototype.CompareTo = function (x) { return compare$1(this, x); };
Long.prototype.toString = function (radix) { return toString$1(this, radix); };
Long.prototype.toJSON = function () { return toString$1(this); };
Object.defineProperty(Long.prototype, "__isLong__", { value: true });
/**
 * @function
 * @param {*} obj Object
 * @returns {boolean}
 * @inner
 */
function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
}
/**
 * Tests if the specified object is a Long.
 * @function
 * @param {*} obj Object
 * @returns {boolean}
 */
// Long.isLong = isLong;
/**
 * A cache of the Long representations of small integer values.
 * @type {!Object}
 * @inner
 */
var INT_CACHE = {};
/**
 * A cache of the Long representations of small unsigned integer values.
 * @type {!Object}
 * @inner
 */
var UINT_CACHE = {};
/**
 * @param {number} value
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
    if (unsigned) {
        value >>>= 0;
        if (cache = (0 <= value && value < 256)) {
            cachedObj = UINT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
        if (cache)
            UINT_CACHE[value] = obj;
        return obj;
    }
    else {
        value |= 0;
        if (cache = (-128 <= value && value < 128)) {
            cachedObj = INT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, value < 0 ? -1 : 0, false);
        if (cache)
            INT_CACHE[value] = obj;
        return obj;
    }
}
/**
 * Returns a Long representing the given 32 bit integer value.
 * @function
 * @param {number} value The 32 bit integer in question
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long} The corresponding Long value
 */
// Long.fromInt = fromInt;
/**
 * @param {number} value
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromNumber(value, unsigned) {
    if (isNaN(value))
        return unsigned ? UZERO : ZERO;
    if (unsigned) {
        if (value < 0)
            return UZERO;
        if (value >= TWO_PWR_64_DBL)
            return MAX_UNSIGNED_VALUE;
    }
    else {
        if (value <= -TWO_PWR_63_DBL)
            return MIN_VALUE;
        if (value + 1 >= TWO_PWR_63_DBL)
            return MAX_VALUE;
    }
    if (value < 0)
        return negate(fromNumber(-value, unsigned));
    return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
}
/**
 * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
 * @function
 * @param {number} value The number in question
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long} The corresponding Long value
 */
// Long.fromNumber = fromNumber;
/**
 * @param {number} lowBits
 * @param {number} highBits
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
}
/**
 * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
 *  assumed to use 32 bits.
 * @function
 * @param {number} lowBits The low 32 bits
 * @param {number} highBits The high 32 bits
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long} The corresponding Long value
 */
// Long.fromBits = fromBits;
/**
 * @function
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 * @inner
 */
var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
/**
 * @param {string} str
 * @param {(boolean|number)=} unsigned
 * @param {number=} radix
 * @returns {!Long}
 * @inner
 */
function fromString(str, unsigned, radix) {
    if (str.length === 0)
        throw Error('empty string');
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
        return ZERO;
    if (typeof unsigned === 'number') {
        // For goog.math.long compatibility
        radix = unsigned,
            unsigned = false;
    }
    else {
        unsigned = !!unsigned;
    }
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
        throw RangeError('radix');
    var p = str.indexOf('-');
    if (p > 0)
        throw Error('interior hyphen');
    else if (p === 0) {
        return negate(fromString(str.substring(1), unsigned, radix));
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
    for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
            var power = fromNumber(pow_dbl(radix, size));
            result = add(multiply(result, power), fromNumber(value));
        }
        else {
            result = multiply(result, radixToPower);
            result = add(result, fromNumber(value));
        }
    }
    result.unsigned = unsigned;
    return result;
}
/**
 * Returns a Long representation of the given string, written using the specified radix.
 * @function
 * @param {string} str The textual representation of the Long
 * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
 * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
 * @returns {!Long} The corresponding Long value
 */
// Long.fromString = fromString;
/**
 * @function
 * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromValue(val, unsigned) {
    if (typeof val === 'number')
        return fromNumber(val, unsigned);
    if (typeof val === 'string')
        return fromString(val, unsigned);
    // Throws for non-objects, converts non-instanceof Long:
    return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
}
/**
 * Converts the specified value to a Long using the appropriate from* function for its type.
 * @function
 * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long}
 */
// Long.fromValue = fromValue;
// NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
// no runtime penalty for these.
/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_16_DBL = 1 << 16;
/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_24_DBL = 1 << 24;
/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
/**
 * @type {!Long}
 * @const
 * @inner
 */
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
/**
 * @type {!Long}
 * @inner
 */
var ZERO = fromInt(0);
/**
 * Signed zero.
 * @type {!Long}
 */
// Long.ZERO = ZERO;
/**
 * @type {!Long}
 * @inner
 */
var UZERO = fromInt(0, true);
/**
 * Unsigned zero.
 * @type {!Long}
 */
// Long.UZERO = UZERO;
/**
 * @type {!Long}
 * @inner
 */
var ONE = fromInt(1);
/**
 * Signed one.
 * @type {!Long}
 */
// Long.ONE = ONE;
/**
 * @type {!Long}
 * @inner
 */
var UONE = fromInt(1, true);
/**
 * Unsigned one.
 * @type {!Long}
 */
// Long.UONE = UONE;
/**
 * @type {!Long}
 * @inner
 */
var NEG_ONE = fromInt(-1);
/**
 * Signed negative one.
 * @type {!Long}
 */
// Long.NEG_ONE = NEG_ONE;
/**
 * @type {!Long}
 * @inner
 */
var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
/**
 * Maximum signed value.
 * @type {!Long}
 */
// Long.MAX_VALUE = MAX_VALUE;
/**
 * @type {!Long}
 * @inner
 */
var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
/**
 * Maximum unsigned value.
 * @type {!Long}
 */
// Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
/**
 * @type {!Long}
 * @inner
 */
var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);
/**
 * Minimum signed value.
 * @type {!Long}
 */
// Long.MIN_VALUE = MIN_VALUE;
/**
 * @alias Long.prototype
 * @inner
 */
// var LongPrototype = Long.prototype;
/**
 * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
 * @this {!Long}
 * @returns {number}
 */
function toInt($this) {
    return $this.unsigned ? $this.low >>> 0 : $this.low;
}
/**
 * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
 * @this {!Long}
 * @returns {number}
 */
function toNumber($this) {
    if ($this.unsigned)
        return (($this.high >>> 0) * TWO_PWR_32_DBL) + ($this.low >>> 0);
    return $this.high * TWO_PWR_32_DBL + ($this.low >>> 0);
}
/**
 * Converts the Long to a string written in the specified radix.
 * @this {!Long}
 * @param {number=} radix Radix (2-36), defaults to 10
 * @returns {string}
 * @override
 * @throws {RangeError} If `radix` is out of range
 */
function toString$1($this, radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
        throw RangeError('radix');
    if (isZero($this))
        return '0';
    if (isNegative($this)) { // Unsigned Longs are never negative
        if (equals$2($this, MIN_VALUE)) {
            // We need to change the Long value before it can be negated, so we remove
            // the bottom-most digit in this base and then recurse to do the rest.
            var radixLong = fromNumber(radix), div = divide($this, radixLong), rem1 = subtract(multiply(div, radixLong), $this);
            return toString$1(div, radix) + toInt(rem1).toString(radix);
        }
        else
            return '-' + toString$1(negate($this), radix);
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = fromNumber(pow_dbl(radix, 6), $this.unsigned), rem = $this;
    var result = '';
    while (true) {
        var remDiv = divide(rem, radixToPower), intval = toInt(subtract(rem, multiply(remDiv, radixToPower))) >>> 0, digits = intval.toString(radix);
        rem = remDiv;
        if (isZero(rem))
            return digits + result;
        else {
            while (digits.length < 6)
                digits = '0' + digits;
            result = '' + digits + result;
        }
    }
}
/**
 * Tests if this Long's value equals zero.
 * @this {!Long}
 * @returns {boolean}
 */
function isZero($this) {
    return $this.high === 0 && $this.low === 0;
}
/**
 * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
 * @returns {boolean}
 */
// LongPrototype.eqz = LongPrototype.isZero;
/**
 * Tests if this Long's value is negative.
 * @this {!Long}
 * @returns {boolean}
 */
function isNegative($this) {
    return !$this.unsigned && $this.high < 0;
}
/**
 * Tests if this Long's value is odd.
 * @this {!Long}
 * @returns {boolean}
 */
function isOdd($this) {
    return ($this.low & 1) === 1;
}
/**
 * Tests if this Long's value equals the specified's.
 * @this {!Long}
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
function equals$2($this, other) {
    if (!isLong(other))
        other = fromValue(other);
    if ($this.unsigned !== other.unsigned && ($this.high >>> 31) === 1 && (other.high >>> 31) === 1)
        return false;
    return $this.high === other.high && $this.low === other.low;
}
/**
 * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
// LongPrototype.neq = LongPrototype.notEquals;
/**
 * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
// LongPrototype.ne = LongPrototype.notEquals;
/**
 * Tests if this Long's value is less than the specified's.
 * @this {!Long}
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
function lessThan($this, other) {
    return compare$1($this, /* validates */ other) < 0;
}
/**
 * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
// LongPrototype.lte = LongPrototype.lessThanOrEqual;
/**
 * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
// LongPrototype.le = LongPrototype.lessThanOrEqual;
/**
 * Tests if this Long's value is greater than the specified's.
 * @this {!Long}
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
function greaterThan($this, other) {
    return compare$1($this, /* validates */ other) > 0;
}
/**
 * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
// LongPrototype.gt = LongPrototype.greaterThan;
/**
 * Tests if this Long's value is greater than or equal the specified's.
 * @this {!Long}
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
function greaterThanOrEqual($this, other) {
    return compare$1($this, /* validates */ other) >= 0;
}
/**
 * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
// LongPrototype.gte = LongPrototype.greaterThanOrEqual;
/**
 * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
// LongPrototype.ge = LongPrototype.greaterThanOrEqual;
/**
 * Compares this Long's value with the specified's.
 * @this {!Long}
 * @param {!Long|number|string} other Other value
 * @returns {number} 0 if they are the same, 1 if the this is greater and -1
 *  if the given one is greater
 */
function compare$1($this, other) {
    if (!isLong(other))
        other = fromValue(other);
    if (equals$2($this, other))
        return 0;
    var thisNeg = isNegative($this), otherNeg = isNegative(other);
    if (thisNeg && !otherNeg)
        return -1;
    if (!thisNeg && otherNeg)
        return 1;
    // At this point the sign bits are the same
    if (!$this.unsigned)
        return isNegative(subtract($this, other)) ? -1 : 1;
    // Both are positive if at least one is unsigned
    return (other.high >>> 0) > ($this.high >>> 0) || (other.high === $this.high && (other.low >>> 0) > ($this.low >>> 0)) ? -1 : 1;
}
/**
 * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {number} 0 if they are the same, 1 if the this is greater and -1
 *  if the given one is greater
 */
// LongPrototype.comp = LongPrototype.compare;
/**
 * Negates this Long's value.
 * @this {!Long}
 * @returns {!Long} Negated Long
 */
function negate($this) {
    if (!$this.unsigned && equals$2($this, MIN_VALUE))
        return MIN_VALUE;
    return add(not($this), ONE);
}
/**
 * Negates this Long's value. This is an alias of {@link Long#negate}.
 * @function
 * @returns {!Long} Negated Long
 */
// LongPrototype.neg = LongPrototype.negate;
/**
 * Returns the sum of this and the specified Long.
 * @this {!Long}
 * @param {!Long|number|string} addend Addend
 * @returns {!Long} Sum
 */
function add($this, addend) {
    if (!isLong(addend))
        addend = fromValue(addend);
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = $this.high >>> 16;
    var a32 = $this.high & 0xFFFF;
    var a16 = $this.low >>> 16;
    var a00 = $this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, $this.unsigned);
}
/**
 * Returns the difference of this and the specified Long.
 * @this {!Long}
 * @param {!Long|number|string} subtrahend Subtrahend
 * @returns {!Long} Difference
 */
function subtract($this, subtrahend) {
    if (!isLong(subtrahend))
        subtrahend = fromValue(subtrahend);
    return add($this, negate(subtrahend));
}
/**
 * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
 * @function
 * @param {!Long|number|string} subtrahend Subtrahend
 * @returns {!Long} Difference
 */
// LongPrototype.sub = LongPrototype.subtract;
/**
 * Returns the product of this and the specified Long.
 * @this {!Long}
 * @param {!Long|number|string} multiplier Multiplier
 * @returns {!Long} Product
 */
function multiply($this, multiplier) {
    if (isZero($this))
        return $this.unsigned ? UZERO : ZERO;
    if (!isLong(multiplier))
        multiplier = fromValue(multiplier);
    // use wasm support if present
    if (wasm) {
        var low = wasm.mul($this.low, $this.high, multiplier.low, multiplier.high);
        return fromBits(low, wasm.get_high(), $this.unsigned);
    }
    if (isZero(multiplier))
        return $this.unsigned ? UZERO : ZERO;
    if (equals$2($this, MIN_VALUE))
        return isOdd(multiplier) ? MIN_VALUE : ZERO;
    if (equals$2(multiplier, MIN_VALUE))
        return isOdd($this) ? MIN_VALUE : ZERO;
    if (isNegative($this)) {
        if (isNegative(multiplier))
            return multiply(negate($this), negate(multiplier));
        else
            return negate(multiply(negate($this), multiplier));
    }
    else if (isNegative(multiplier))
        return negate(multiply($this, negate(multiplier)));
    // If both longs are small, use float multiplication
    if (lessThan($this, TWO_PWR_24) && lessThan(multiplier, TWO_PWR_24))
        return fromNumber(toNumber($this) * toNumber(multiplier), $this.unsigned);
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = $this.high >>> 16;
    var a32 = $this.high & 0xFFFF;
    var a16 = $this.low >>> 16;
    var a00 = $this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, $this.unsigned);
}
/**
 * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
 * @function
 * @param {!Long|number|string} multiplier Multiplier
 * @returns {!Long} Product
 */
// LongPrototype.mul = LongPrototype.multiply;
/**
 * Returns this Long divided by the specified. The result is signed if this Long is signed or
 *  unsigned if this Long is unsigned.
 * @this {!Long}
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Quotient
 */
function divide($this, divisor) {
    if (!isLong(divisor))
        divisor = fromValue(divisor);
    if (isZero(divisor))
        throw Error('division by zero');
    // use wasm support if present
    if (wasm) {
        // guard against signed division overflow: the largest
        // negative number / -1 would be 1 larger than the largest
        // positive number, due to two's complement.
        if (!$this.unsigned &&
            $this.high === -0x80000000 &&
            divisor.low === -1 && divisor.high === -1) {
            // be consistent with non-wasm code path
            return $this;
        }
        var low = ($this.unsigned ? wasm.div_u : wasm.div_s)($this.low, $this.high, divisor.low, divisor.high);
        return fromBits(low, wasm.get_high(), $this.unsigned);
    }
    if (isZero($this))
        return $this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
    if (!$this.unsigned) {
        // This section is only relevant for signed longs and is derived from the
        // closure library as a whole.
        if (equals$2($this, MIN_VALUE)) {
            if (equals$2(divisor, ONE) || equals$2(divisor, NEG_ONE))
                return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
            else if (equals$2(divisor, MIN_VALUE))
                return ONE;
            else {
                // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                var halfThis = shiftRight($this, 1);
                approx = shiftLeft(divide(halfThis, divisor), 1);
                if (equals$2(approx, ZERO)) {
                    return isNegative(divisor) ? ONE : NEG_ONE;
                }
                else {
                    rem = subtract($this, multiply(divisor, approx));
                    res = add(approx, divide(rem, divisor));
                    return res;
                }
            }
        }
        else if (equals$2(divisor, MIN_VALUE))
            return $this.unsigned ? UZERO : ZERO;
        if (isNegative($this)) {
            if (isNegative(divisor))
                return divide(negate($this), negate(divisor));
            return negate(divide(negate($this), divisor));
        }
        else if (isNegative(divisor))
            return negate(divide($this, negate(divisor)));
        res = ZERO;
    }
    else {
        // The algorithm below has not been made for unsigned longs. It's therefore
        // required to take special care of the MSB prior to running it.
        if (!divisor.unsigned)
            divisor = toUnsigned(divisor);
        if (greaterThan(divisor, $this))
            return UZERO;
        if (greaterThan(divisor, shiftRightUnsigned($this, 1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
            return UONE;
        res = UZERO;
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    rem = $this;
    while (greaterThanOrEqual(rem, divisor)) {
        // Approximate the result of division. This may be a little greater or
        // smaller than the actual value.
        approx = Math.max(1, Math.floor(toNumber(rem) / toNumber(divisor)));
        // We will tweak the approximate result by changing it in the 48-th digit or
        // the smallest non-fractional digit, whichever is larger.
        var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48), 
        // Decrease the approximation until it is smaller than the remainder.  Note
        // that if it is too large, the product overflows and is negative.
        approxRes = fromNumber(approx), approxRem = multiply(approxRes, divisor);
        while (isNegative(approxRem) || greaterThan(approxRem, rem)) {
            approx -= delta;
            approxRes = fromNumber(approx, $this.unsigned);
            approxRem = multiply(approxRes, divisor);
        }
        // We know the answer can't be zero... and actually, zero would cause
        // infinite recursion since we would make no progress.
        if (isZero(approxRes))
            approxRes = ONE;
        res = add(res, approxRes);
        rem = subtract(rem, approxRem);
    }
    return res;
}
/**
 * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
 * @function
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Remainder
 */
// LongPrototype.mod = LongPrototype.modulo;
/**
 * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
 * @function
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Remainder
 */
// LongPrototype.rem = LongPrototype.modulo;
/**
 * Returns the bitwise NOT of this Long.
 * @this {!Long}
 * @returns {!Long}
 */
function not($this) {
    return fromBits(~$this.low, ~$this.high, $this.unsigned);
}
/**
 * Returns this Long with bits shifted to the left by the given amount.
 * @this {!Long}
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
function shiftLeft($this, numBits) {
    if (isLong(numBits))
        numBits = toInt(numBits);
    if ((numBits &= 63) === 0)
        return $this;
    else if (numBits < 32)
        return fromBits($this.low << numBits, ($this.high << numBits) | ($this.low >>> (32 - numBits)), $this.unsigned);
    else
        return fromBits(0, $this.low << (numBits - 32), $this.unsigned);
}
/**
 * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
 * @function
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
// LongPrototype.shl = LongPrototype.shiftLeft;
/**
 * Returns this Long with bits arithmetically shifted to the right by the given amount.
 * @this {!Long}
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
function shiftRight($this, numBits) {
    if (isLong(numBits))
        numBits = toInt(numBits);
    if ((numBits &= 63) === 0)
        return $this;
    else if (numBits < 32)
        return fromBits(($this.low >>> numBits) | ($this.high << (32 - numBits)), $this.high >> numBits, $this.unsigned);
    else
        return fromBits($this.high >> (numBits - 32), $this.high >= 0 ? 0 : -1, $this.unsigned);
}
/**
 * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
 * @function
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
// LongPrototype.shr = LongPrototype.shiftRight;
/**
 * Returns this Long with bits logically shifted to the right by the given amount.
 * @this {!Long}
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
function shiftRightUnsigned($this, numBits) {
    if (isLong(numBits))
        numBits = toInt(numBits);
    numBits &= 63;
    if (numBits === 0)
        return $this;
    else {
        var high = $this.high;
        if (numBits < 32) {
            var low = $this.low;
            return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, $this.unsigned);
        }
        else if (numBits === 32)
            return fromBits(high, 0, $this.unsigned);
        else
            return fromBits(high >>> (numBits - 32), 0, $this.unsigned);
    }
}
/**
 * Converts this Long to unsigned.
 * @this {!Long}
 * @returns {!Long} Unsigned long
 */
function toUnsigned($this) {
    if ($this.unsigned)
        return $this;
    return fromBits($this.low, $this.high, true);
}
/**
 * Converts this Long to its byte representation.
 * @param {boolean=} le Whether little or big endian, defaults to big endian
 * @this {!Long}
 * @returns {!Array.<number>} Byte representation
 */
function toBytes($this, le) {
    return le ? toBytesLE($this) : toBytesBE($this);
}
/**
 * Converts this Long to its little endian byte representation.
 * @this {!Long}
 * @returns {!Array.<number>} Little endian byte representation
 */
function toBytesLE($this) {
    var hi = $this.high, lo = $this.low;
    return [
        lo & 0xff,
        lo >>> 8 & 0xff,
        lo >>> 16 & 0xff,
        lo >>> 24,
        hi & 0xff,
        hi >>> 8 & 0xff,
        hi >>> 16 & 0xff,
        hi >>> 24
    ];
}
/**
 * Converts this Long to its big endian byte representation.
 * @this {!Long}
 * @returns {!Array.<number>} Big endian byte representation
 */
function toBytesBE($this) {
    var hi = $this.high, lo = $this.low;
    return [
        hi >>> 24,
        hi >>> 16 & 0xff,
        hi >>> 8 & 0xff,
        hi & 0xff,
        lo >>> 24,
        lo >>> 16 & 0xff,
        lo >>> 8 & 0xff,
        lo & 0xff
    ];
}
/**
 * Creates a Long from its byte representation.
 * @param {!Array.<number>} bytes Byte representation
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @param {boolean=} le Whether little or big endian, defaults to big endian
 * @returns {Long} The corresponding Long value
 */
function fromBytes(bytes, unsigned, le) {
    return le ? fromBytesLE(bytes, unsigned) : fromBytesBE(bytes, unsigned);
}
/**
 * Creates a Long from its little endian byte representation.
 * @param {!Array.<number>} bytes Little endian byte representation
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {Long} The corresponding Long value
 */
function fromBytesLE(bytes, unsigned) {
    return new Long(bytes[0] |
        bytes[1] << 8 |
        bytes[2] << 16 |
        bytes[3] << 24, bytes[4] |
        bytes[5] << 8 |
        bytes[6] << 16 |
        bytes[7] << 24, unsigned);
}
/**
 * Creates a Long from its big endian byte representation.
 * @param {!Array.<number>} bytes Big endian byte representation
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {Long} The corresponding Long value
 */
function fromBytesBE(bytes, unsigned) {
    return new Long(bytes[4] << 24 |
        bytes[5] << 16 |
        bytes[6] << 8 |
        bytes[7], bytes[0] << 24 |
        bytes[1] << 16 |
        bytes[2] << 8 |
        bytes[3], unsigned);
}

var Long$1 = Long;
const op_Multiply = multiply;
const compare$2 = compare$1;
const fromBytes$1 = fromBytes;
const toBytes$1 = toBytes;
const toString$2 = toString$1;

class Enumerator {
    constructor(iter) {
        this.iter = iter;
    }
    ["System.Collections.Generic.IEnumerator`1.get_Current"]() {
        return this.current;
    }
    ["System.Collections.IEnumerator.get_Current"]() {
        return this.current;
    }
    ["System.Collections.IEnumerator.MoveNext"]() {
        const cur = this.iter.next();
        this.current = cur.value;
        return !cur.done;
    }
    ["System.Collections.IEnumerator.Reset"]() {
        throw new Error("JS iterators cannot be reset");
    }
    Dispose() {
        return;
    }
}
function getEnumerator(o) {
    return typeof o.GetEnumerator === "function"
        ? o.GetEnumerator()
        : new Enumerator(o[Symbol.iterator]());
}
class Seq {
    constructor(f) {
        this.f = f;
    }
    [Symbol.iterator]() { return new Seq(this.f); }
    next() {
        var _a;
        this.iter = (_a = this.iter) !== null && _a !== void 0 ? _a : this.f();
        return this.iter.next();
    }
    toString() {
        return "seq [" + Array.from(this).join("; ") + "]";
    }
}
function makeSeq(f) {
    return new Seq(f);
}
function isArrayOrBufferView(xs) {
    return Array.isArray(xs) || ArrayBuffer.isView(xs);
}
function append(xs, ys) {
    return delay(() => {
        let firstDone = false;
        const i = xs[Symbol.iterator]();
        let iters = [i, undefined];
        return unfold(() => {
            var _a, _b;
            let cur;
            if (!firstDone) {
                cur = (_a = iters[0]) === null || _a === void 0 ? void 0 : _a.next();
                if (cur != null && !cur.done) {
                    return [cur.value, iters];
                }
                else {
                    firstDone = true;
                    iters = [undefined, ys[Symbol.iterator]()];
                }
            }
            cur = (_b = iters[1]) === null || _b === void 0 ? void 0 : _b.next();
            return cur != null && !cur.done ? [cur.value, iters] : undefined;
        }, iters);
    });
}
function concat(xs) {
    return delay(() => {
        const iter = xs[Symbol.iterator]();
        let output;
        return unfold((innerIter) => {
            let hasFinished = false;
            while (!hasFinished) {
                if (innerIter == null) {
                    const cur = iter.next();
                    if (!cur.done) {
                        innerIter = cur.value[Symbol.iterator]();
                    }
                    else {
                        hasFinished = true;
                    }
                }
                else {
                    const cur = innerIter.next();
                    if (!cur.done) {
                        output = cur.value;
                        hasFinished = true;
                    }
                    else {
                        innerIter = undefined;
                    }
                }
            }
            return innerIter != null ? [output, innerIter] : undefined;
        }, undefined);
    });
}
function collect(f, xs) {
    return concat(map(f, xs));
}
function delay(f) {
    return makeSeq(() => f()[Symbol.iterator]());
}
function singleton(y) {
    return delay(() => [y]);
}
function fold(f, acc, xs) {
    if (isArrayOrBufferView(xs)) {
        return xs.reduce(f, acc);
    }
    else {
        let cur;
        for (let i = 0, iter = xs[Symbol.iterator]();; i++) {
            cur = iter.next();
            if (cur.done) {
                break;
            }
            acc = f(acc, cur.value, i);
        }
        return acc;
    }
}
function map(f, xs) {
    return delay(() => unfold((iter) => {
        const cur = iter.next();
        return !cur.done ? [f(cur.value), iter] : undefined;
    }, xs[Symbol.iterator]()));
}
function unfold(f, fst) {
    return makeSeq(() => {
        // Capture a copy of the first value in the closure
        // so the sequence is restarted every time, see #1230
        let acc = fst;
        const iter = {
            next() {
                const res = f(acc);
                if (res != null) {
                    const v = value(res);
                    if (v != null) {
                        acc = v[1];
                        return { done: false, value: v[0] };
                    }
                }
                return { done: true, value: undefined };
            },
        };
        return iter;
    });
}

/**
 * DateTimeOffset functions.
 *
 * Note: Date instances are always DateObjects in local
 * timezone (because JS dates are all kinds of messed up).
 * A local date returns UTC epoc when `.getTime()` is called.
 *
 * Basically; invariant: date.getTime() always return UTC time.
 */
function dateOffsetToString(offset) {
    const isMinus = offset < 0;
    offset = Math.abs(offset);
    const hours = ~~(offset / 3600000);
    const minutes = (offset % 3600000) / 60000;
    return (isMinus ? "-" : "+") +
        padWithZeros(hours, 2) + ":" +
        padWithZeros(minutes, 2);
}
function dateToHalfUTCString(date, half) {
    const str = date.toISOString();
    return half === "first"
        ? str.substring(0, str.indexOf("T"))
        : str.substring(str.indexOf("T") + 1, str.length - 1);
}
function dateToISOString(d, utc) {
    if (utc) {
        return d.toISOString();
    }
    else {
        // JS Date is always local
        const printOffset = d.kind == null ? true : d.kind === 2 /* Local */;
        return padWithZeros(d.getFullYear(), 4) + "-" +
            padWithZeros(d.getMonth() + 1, 2) + "-" +
            padWithZeros(d.getDate(), 2) + "T" +
            padWithZeros(d.getHours(), 2) + ":" +
            padWithZeros(d.getMinutes(), 2) + ":" +
            padWithZeros(d.getSeconds(), 2) + "." +
            padWithZeros(d.getMilliseconds(), 3) +
            (printOffset ? dateOffsetToString(d.getTimezoneOffset() * -60000) : "");
    }
}
function dateToISOStringWithOffset(dateWithOffset, offset) {
    const str = dateWithOffset.toISOString();
    return str.substring(0, str.length - 1) + dateOffsetToString(offset);
}
function dateToStringWithCustomFormat(date, format, utc) {
    return format.replace(/(\w)\1*/g, (match) => {
        let rep = Number.NaN;
        switch (match.substring(0, 1)) {
            case "y":
                const y = utc ? date.getUTCFullYear() : date.getFullYear();
                rep = match.length < 4 ? y % 100 : y;
                break;
            case "M":
                rep = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
                break;
            case "d":
                rep = utc ? date.getUTCDate() : date.getDate();
                break;
            case "H":
                rep = utc ? date.getUTCHours() : date.getHours();
                break;
            case "h":
                const h = utc ? date.getUTCHours() : date.getHours();
                rep = h > 12 ? h % 12 : h;
                break;
            case "m":
                rep = utc ? date.getUTCMinutes() : date.getMinutes();
                break;
            case "s":
                rep = utc ? date.getUTCSeconds() : date.getSeconds();
                break;
            case "f":
                rep = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
                break;
        }
        if (Number.isNaN(rep)) {
            return match;
        }
        else {
            return (rep < 10 && match.length > 1) ? "0" + rep : "" + rep;
        }
    });
}
function dateToStringWithOffset(date, format) {
    var _a, _b, _c;
    const d = new Date(date.getTime() + ((_a = date.offset) !== null && _a !== void 0 ? _a : 0));
    if (typeof format !== "string") {
        return d.toISOString().replace(/\.\d+/, "").replace(/[A-Z]|\.\d+/g, " ") + dateOffsetToString(((_b = date.offset) !== null && _b !== void 0 ? _b : 0));
    }
    else if (format.length === 1) {
        switch (format) {
            case "D":
            case "d": return dateToHalfUTCString(d, "first");
            case "T":
            case "t": return dateToHalfUTCString(d, "second");
            case "O":
            case "o": return dateToISOStringWithOffset(d, ((_c = date.offset) !== null && _c !== void 0 ? _c : 0));
            default: throw new Error("Unrecognized Date print format");
        }
    }
    else {
        return dateToStringWithCustomFormat(d, format, true);
    }
}
function dateToStringWithKind(date, format) {
    const utc = date.kind === 1 /* UTC */;
    if (typeof format !== "string") {
        return utc ? date.toUTCString() : date.toLocaleString();
    }
    else if (format.length === 1) {
        switch (format) {
            case "D":
            case "d":
                return utc ? dateToHalfUTCString(date, "first") : date.toLocaleDateString();
            case "T":
            case "t":
                return utc ? dateToHalfUTCString(date, "second") : date.toLocaleTimeString();
            case "O":
            case "o":
                return dateToISOString(date, utc);
            default:
                throw new Error("Unrecognized Date print format");
        }
    }
    else {
        return dateToStringWithCustomFormat(date, format, utc);
    }
}
function toString$3(date, format, _provider) {
    return date.offset != null
        ? dateToStringWithOffset(date, format)
        : dateToStringWithKind(date, format);
}

const fsFormatRegExp = /(^|[^%])%([0+\- ]*)(\d+)?(?:\.(\d+))?(\w)/;
// These are used for formatting and only take longs and decimals into account (no bigint)
function isNumeric(x) {
    return typeof x === "number" || x instanceof Long$1 || x instanceof Big;
}
function isLessThan(x, y) {
    if (x instanceof Long$1) {
        return compare$2(x, y) < 0;
    }
    else if (x instanceof Big) {
        return x.cmp(y) < 0;
    }
    else {
        return x < y;
    }
}
function multiply$1(x, y) {
    if (x instanceof Long$1) {
        return op_Multiply(x, y);
    }
    else if (x instanceof Big) {
        return x.mul(y);
    }
    else {
        return x * y;
    }
}
function toFixed(x, dp) {
    if (x instanceof Long$1) {
        return String(x) + (0).toFixed(dp).substr(1);
    }
    else {
        return x.toFixed(dp);
    }
}
function toPrecision(x, sd) {
    if (x instanceof Long$1) {
        return String(x) + (0).toPrecision(sd).substr(1);
    }
    else {
        return x.toPrecision(sd);
    }
}
function toExponential(x, dp) {
    if (x instanceof Long$1) {
        return String(x) + (0).toExponential(dp).substr(1);
    }
    else {
        return x.toExponential(dp);
    }
}
function toHex(x) {
    if (x instanceof Long$1) {
        return toString$2(x.unsigned ? x : fromBytes$1(toBytes$1(x), true), 16);
    }
    else {
        return (Number(x) >>> 0).toString(16);
    }
}
function printf(input) {
    return {
        input,
        cont: fsFormat(input),
    };
}
function continuePrint(cont, arg) {
    return typeof arg === "string" ? cont(arg) : arg.cont(cont);
}
function toText(arg) {
    return continuePrint((x) => x, arg);
}
function formatReplacement(rep, prefix, flags, padLength, precision, format) {
    let sign = "";
    flags = flags || "";
    format = format || "";
    if (isNumeric(rep)) {
        if (format.toLowerCase() !== "x") {
            if (isLessThan(rep, 0)) {
                rep = multiply$1(rep, -1);
                sign = "-";
            }
            else {
                if (flags.indexOf(" ") >= 0) {
                    sign = " ";
                }
                else if (flags.indexOf("+") >= 0) {
                    sign = "+";
                }
            }
        }
        precision = precision == null ? null : parseInt(precision, 10);
        switch (format) {
            case "f":
            case "F":
                precision = precision != null ? precision : 6;
                rep = toFixed(rep, precision);
                break;
            case "g":
            case "G":
                rep = precision != null ? toPrecision(rep, precision) : toPrecision(rep);
                break;
            case "e":
            case "E":
                rep = precision != null ? toExponential(rep, precision) : toExponential(rep);
                break;
            case "x":
                rep = toHex(rep);
                break;
            case "X":
                rep = toHex(rep).toUpperCase();
                break;
            default: // AOid
                rep = String(rep);
                break;
        }
    }
    else if (rep instanceof Date) {
        rep = toString$3(rep);
    }
    else {
        rep = toString(rep);
    }
    padLength = parseInt(padLength, 10);
    if (!isNaN(padLength)) {
        const zeroFlag = flags.indexOf("0") >= 0; // Use '0' for left padding
        const minusFlag = flags.indexOf("-") >= 0; // Right padding
        const ch = minusFlag || !zeroFlag ? " " : "0";
        if (ch === "0") {
            rep = padLeft(rep, padLength - sign.length, ch, minusFlag);
            rep = sign + rep;
        }
        else {
            rep = padLeft(sign + rep, padLength, ch, minusFlag);
        }
    }
    else {
        rep = sign + rep;
    }
    return prefix ? prefix + rep : rep;
}
function formatOnce(str2, rep) {
    return str2.replace(fsFormatRegExp, (_, prefix, flags, padLength, precision, format) => {
        const once = formatReplacement(rep, prefix, flags, padLength, precision, format);
        return once.replace(/%/g, "%%");
    });
}
function createPrinter(str, cont) {
    return (...args) => {
        // Make a copy as the function may be used several times
        let strCopy = str;
        for (const arg of args) {
            strCopy = formatOnce(strCopy, arg);
        }
        return fsFormatRegExp.test(strCopy)
            ? createPrinter(strCopy, cont)
            : cont(strCopy.replace(/%%/g, "%"));
    };
}
function fsFormat(str) {
    return (cont) => {
        return fsFormatRegExp.test(str)
            ? createPrinter(str, cont)
            : cont(str);
    };
}
function isNullOrWhiteSpace(str) {
    return typeof str !== "string" || /^\s*$/.test(str);
}
function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    len = len - str.length;
    for (let i = 0; i < len; i++) {
        str = isRight ? str + ch : ch + str;
    }
    return str;
}

function empty() {
    return new List();
}

function singleton$1(x) {
    return new List(x, empty());
}

function fold$1(f_mut, state_mut, xs_mut) {
    fold:
    while (true) {
        const f = f_mut, state = state_mut, xs = xs_mut;
        if (xs.tail != null) {
            f_mut = f;
            state_mut = f(state, xs.head);
            xs_mut = xs.tail;
            continue fold;
        }
        else {
            return state;
        }
    }
}

function reverse(xs) {
    return fold$1((acc, x) => (new List(x, acc)), new List(), xs);
}

function ofSeq(xs) {
    return reverse(fold((acc, x) => (new List(x, acc)), new List(), xs));
}

function map$1(f, xs) {
    return reverse(fold$1((acc, x) => (new List(f(x), acc)), new List(), xs));
}

function iterate(f, xs) {
    fold$1((unitVar0, x) => {
        f(x);
    }, void 0, xs);
}

function ofArrayWithTail(xs, tail_1) {
    let res = tail_1;
    for (let i = count(xs) - 1; i >= 0; i--) {
        res = (new List(xs[i], res));
    }
    return res;
}

function ofArray(xs) {
    return ofArrayWithTail(xs, new List());
}

function choose(f, xs) {
    return reverse(fold$1((acc, x) => {
        const matchValue = f(x);
        return (matchValue == null) ? acc : (new List(value(matchValue), acc));
    }, new List(), xs));
}

function contains(value, list, eq) {
    const loop = (xs_mut) => {
        loop:
        while (true) {
            const xs = xs_mut;
            if (xs.tail != null) {
                if (eq.Equals(value, xs.head)) {
                    return true;
                }
                else {
                    xs_mut = xs.tail;
                    continue loop;
                }
            }
            else {
                return false;
            }
        }
    };
    return loop(list);
}

function exists(f_mut, _arg1_mut) {
    exists:
    while (true) {
        const f = f_mut, _arg1 = _arg1_mut;
        if (_arg1.tail != null) {
            if (f(_arg1.head)) {
                return true;
            }
            else {
                f_mut = f;
                _arg1_mut = _arg1.tail;
                continue exists;
            }
        }
        else {
            return false;
        }
    }
}

// From https://gist.github.com/LeverOne/1308368
function newGuid() {
    let b = "";
    for (let a = 0; a++ < 36;) {
        b += a * 51 & 52
            ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16)
            : "-";
    }
    return b;
}

class CancellationToken {
    constructor(cancelled = false) {
        this._id = 0;
        this._cancelled = cancelled;
        this._listeners = new Map();
    }
    get isCancelled() {
        return this._cancelled;
    }
    cancel() {
        if (!this._cancelled) {
            this._cancelled = true;
            for (const [, listener] of this._listeners) {
                listener();
            }
        }
    }
    addListener(f) {
        const id = this._id;
        this._listeners.set(this._id++, f);
        return id;
    }
    removeListener(id) {
        return this._listeners.delete(id);
    }
    register(f, state) {
        const $ = this;
        const id = this.addListener(state == null ? f : () => f(state));
        return { Dispose() { $.removeListener(id); } };
    }
}
class OperationCanceledError extends Error {
    constructor() {
        super("The operation was canceled");
        Object.setPrototypeOf(this, OperationCanceledError.prototype);
    }
}
class Trampoline {
    constructor() {
        this.callCount = 0;
    }
    static get maxTrampolineCallCount() {
        return 2000;
    }
    incrementAndCheck() {
        return this.callCount++ > Trampoline.maxTrampolineCallCount;
    }
    hijack(f) {
        this.callCount = 0;
        setTimeout(f, 0);
    }
}
function protectedCont(f) {
    return (ctx) => {
        if (ctx.cancelToken.isCancelled) {
            ctx.onCancel(new OperationCanceledError());
        }
        else if (ctx.trampoline.incrementAndCheck()) {
            ctx.trampoline.hijack(() => {
                try {
                    f(ctx);
                }
                catch (err) {
                    ctx.onError(err);
                }
            });
        }
        else {
            try {
                f(ctx);
            }
            catch (err) {
                ctx.onError(err);
            }
        }
    };
}
function protectedBind(computation, binder) {
    return protectedCont((ctx) => {
        computation({
            onSuccess: (x) => {
                try {
                    binder(x)(ctx);
                }
                catch (ex) {
                    ctx.onError(ex);
                }
            },
            onError: ctx.onError,
            onCancel: ctx.onCancel,
            cancelToken: ctx.cancelToken,
            trampoline: ctx.trampoline,
        });
    });
}
function protectedReturn(value) {
    return protectedCont((ctx) => ctx.onSuccess(value));
}
class AsyncBuilder {
    Bind(computation, binder) {
        return protectedBind(computation, binder);
    }
    Combine(computation1, computation2) {
        return this.Bind(computation1, () => computation2);
    }
    Delay(generator) {
        return protectedCont((ctx) => generator()(ctx));
    }
    For(sequence, body) {
        const iter = sequence[Symbol.iterator]();
        let cur = iter.next();
        return this.While(() => !cur.done, this.Delay(() => {
            const res = body(cur.value);
            cur = iter.next();
            return res;
        }));
    }
    Return(value) {
        return protectedReturn(value);
    }
    ReturnFrom(computation) {
        return computation;
    }
    TryFinally(computation, compensation) {
        return protectedCont((ctx) => {
            computation({
                onSuccess: (x) => {
                    compensation();
                    ctx.onSuccess(x);
                },
                onError: (x) => {
                    compensation();
                    ctx.onError(x);
                },
                onCancel: (x) => {
                    compensation();
                    ctx.onCancel(x);
                },
                cancelToken: ctx.cancelToken,
                trampoline: ctx.trampoline,
            });
        });
    }
    TryWith(computation, catchHandler) {
        return protectedCont((ctx) => {
            computation({
                onSuccess: ctx.onSuccess,
                onCancel: ctx.onCancel,
                cancelToken: ctx.cancelToken,
                trampoline: ctx.trampoline,
                onError: (ex) => {
                    try {
                        catchHandler(ex)(ctx);
                    }
                    catch (ex2) {
                        ctx.onError(ex2);
                    }
                },
            });
        });
    }
    Using(resource, binder) {
        return this.TryFinally(binder(resource), () => resource.Dispose());
    }
    While(guard, computation) {
        if (guard()) {
            return this.Bind(computation, () => this.While(guard, computation));
        }
        else {
            return this.Return(void 0);
        }
    }
    Zero() {
        return protectedCont((ctx) => ctx.onSuccess(void 0));
    }
}
const singleton$2 = new AsyncBuilder();

class FSharpChoice$2 extends Union {
    constructor(tag, ...fields) {
        super();
        this.tag = (tag | 0);
        this.fields = fields;
    }
    cases() {
        return ["Choice1Of2", "Choice2Of2"];
    }
}

function Choice_makeChoice1Of2(x) {
    return new FSharpChoice$2(0, x);
}

function Choice_makeChoice2Of2(x) {
    return new FSharpChoice$2(1, x);
}

function emptyContinuation(_x) {
    // NOP
}
function awaitPromise(p) {
    return fromContinuations((conts) => p.then(conts[0]).catch((err) => (err instanceof OperationCanceledError
        ? conts[2] : conts[1])(err)));
}
const defaultCancellationToken = new CancellationToken();
function catchAsync(work) {
    return protectedCont((ctx) => {
        work({
            onSuccess: (x) => ctx.onSuccess(Choice_makeChoice1Of2(x)),
            onError: (ex) => ctx.onSuccess(Choice_makeChoice2Of2(ex)),
            onCancel: ctx.onCancel,
            cancelToken: ctx.cancelToken,
            trampoline: ctx.trampoline,
        });
    });
}
function fromContinuations(f) {
    return protectedCont((ctx) => f([ctx.onSuccess, ctx.onError, ctx.onCancel]));
}
function ignore(computation) {
    return protectedBind(computation, (_x) => protectedReturn(void 0));
}
function sleep(millisecondsDueTime) {
    return protectedCont((ctx) => {
        let tokenId;
        const timeoutId = setTimeout(() => {
            ctx.cancelToken.removeListener(tokenId);
            ctx.onSuccess(void 0);
        }, millisecondsDueTime);
        tokenId = ctx.cancelToken.addListener(() => {
            clearTimeout(timeoutId);
            ctx.onCancel(new OperationCanceledError());
        });
    });
}
function start(computation, cancellationToken) {
    return startWithContinuations(computation, cancellationToken);
}
function startImmediate(computation, cancellationToken) {
    return start(computation, cancellationToken);
}
function startWithContinuations(computation, continuation, exceptionContinuation, cancellationContinuation, cancelToken) {
    if (typeof continuation !== "function") {
        cancelToken = continuation;
        continuation = undefined;
    }
    const trampoline = new Trampoline();
    computation({
        onSuccess: continuation ? continuation : emptyContinuation,
        onError: exceptionContinuation ? exceptionContinuation : emptyContinuation,
        onCancel: cancellationContinuation ? cancellationContinuation : emptyContinuation,
        cancelToken: cancelToken ? cancelToken : defaultCancellationToken,
        trampoline,
    });
}

class FocusState extends Union {
    constructor(tag, ...fields) {
        super();
        this.tag = (tag | 0);
        this.fields = fields;
    }
    cases() {
        return ["Normal", "Pending", "Focused"];
    }
}

class TestCase extends Union {
    constructor(tag, ...fields) {
        super();
        this.tag = (tag | 0);
        this.fields = fields;
    }
    cases() {
        return ["SyncTest", "AsyncTest", "TestList", "TestListSequential"];
    }
}

function Test_testCase(name, body) {
    return new TestCase(0, name, body, new FocusState(0));
}

function Test_testCaseAsync(name, body) {
    return new TestCase(1, name, body, new FocusState(0));
}

function Test_testList(name, tests) {
    return new TestCase(2, name, tests);
}

const Env_insideBrowser = (new Function("try {return this===window;}catch(e){ return false;}"))();

function Expect_isFalse(cond) {
    return (msg) => {
        const actual = cond;
        const expected_1 = false;
        const msg_1 = msg;
        if ((actual === expected_1) ? true : (!(new Function("try {return this===window;}catch(e){ return false;}"))())) {
            assertEqual(actual, expected_1, msg_1);
        }
        else {
            let valueType;
            valueType = bool_type;
            const primitiveTypes = ofArray([int32_type, bool_type, float64_type, string_type, class_type("System.Decimal"), class_type("System.Guid")]);
            let errorMsg;
            if (contains(valueType, primitiveTypes, {
                Equals: equals$1,
                GetHashCode: structuralHash,
            })) {
                const arg20 = toString(actual);
                const arg10 = toString(expected_1);
                errorMsg = toText(printf("\u003cspan style=\u0027color:black\u0027\u003eExpected:\u003c/span\u003e \u003cbr /\u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eActual:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px;color:crimson\u0027\u003e%s\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eMessage:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e"))(arg10)(arg20)(msg_1);
            }
            else {
                errorMsg = toText(printf("\u003cspan style=\u0027color:black\u0027\u003eExpected:\u003c/span\u003e \u003cbr /\u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%A\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eActual:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px;color:crimson\u0027\u003e%A\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eMessage:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e"))(expected_1)(actual)(msg_1);
            }
            throw (new Error(errorMsg));
        }
    };
}

class Html_Node extends Record {
    constructor(Tag, Attributes, Content, Children) {
        super();
        this.Tag = Tag;
        this.Attributes = Attributes;
        this.Content = Content;
        this.Children = Children;
    }
}

function Html_createNode(node) {
    const el = document.createElement(node.Tag);
    el.innerHTML = node.Content;
    const enumerator = getEnumerator(node.Attributes);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const attrValue = forLoopVar[1];
            const attrName = forLoopVar[0];
            el.setAttribute(attrName, attrValue);
        }
    }
    finally {
        enumerator.Dispose();
    }
    const enumerator_1 = getEnumerator(node.Children);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            const child = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const childElement = Html_createNode(child);
            el.appendChild(childElement);
        }
    }
    finally {
        enumerator_1.Dispose();
    }
    return el;
}

function Html_simpleDiv(attrs, content) {
    return new Html_Node("div", attrs, content, empty());
}

function Html_div(attrs, children) {
    return new Html_Node("div", attrs, "", children);
}

function Mocha_isFocused(test) {
    let pattern_matching_result, tests, tests_1;
    if (test.tag === 1) {
        if (test.fields[2].tag === 2) {
            pattern_matching_result = 1;
        }
        else {
            pattern_matching_result = 4;
        }
    }
    else if (test.tag === 2) {
        pattern_matching_result = 2;
        tests = test.fields[1];
    }
    else if (test.tag === 3) {
        pattern_matching_result = 3;
        tests_1 = test.fields[1];
    }
    else if (test.fields[2].tag === 2) {
        pattern_matching_result = 0;
    }
    else {
        pattern_matching_result = 4;
    }
    switch (pattern_matching_result) {
        case 0: {
            return true;
        }
        case 1: {
            return true;
        }
        case 2: {
            return exists(Mocha_isFocused, tests);
        }
        case 3: {
            return exists(Mocha_isFocused, tests_1);
        }
        case 4: {
            return false;
        }
    }
}

function Mocha_runSyncTestInBrowser(name, test, padding) {
    try {
        test();
        return Html_simpleDiv(ofArray([["data-test", name], ["class", "passed"], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:green"))(padding)]]), toText(printf("✔ %s"))(name));
    }
    catch (ex) {
        const error = new Html_Node("div", singleton$1(["style", "font-size:16px;color:red;margin:10px; padding:10px; border: 1px solid red; border-radius: 10px;"]), ex.message, empty());
        return Html_div(empty(), ofArray([Html_simpleDiv(ofArray([["data-test", name], ["class", "failed"], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:red"))(padding)]]), toText(printf("✘ %s"))(name)), error]));
    }
}

function Mocha_runAsyncTestInBrowser(name, test, padding) {
    let id;
    let copyOfStruct = newGuid();
    id = copyOfStruct;
    startImmediate(singleton$2.Delay(() => singleton$2.Bind(sleep(1000), () => singleton$2.Bind(catchAsync(test), (_arg2) => {
        if (_arg2.tag === 1) {
            const err = _arg2.fields[0];
            const div_1 = document.getElementById(id);
            div_1.innerHTML = toText(printf("✘ %s"))(name);
            const error = new Html_Node("div", singleton$1(["style", "margin:10px; padding:10px; border: 1px solid red; border-radius: 10px"]), err.message, empty());
            div_1.setAttribute("style", toText(printf("font-size:16px; padding-left:%dpx;color:red"))(padding));
            div_1.setAttribute("class", "failed");
            div_1.appendChild(Html_createNode(error));
            return singleton$2.Zero();
        }
        else {
            const div = document.getElementById(id);
            div.innerHTML = toText(printf("✔ %s"))(name);
            div.setAttribute("class", "passed");
            div.setAttribute("style", toText(printf("font-size:16px; padding-left:%dpx;color:green"))(padding));
            return singleton$2.Zero();
        }
    }))));
    return Html_simpleDiv(ofArray([["id", id], ["data-test", name], ["class", "executing"], ["style", toText(printf("font-size:16px; padding-left:%dpx;color:gray"))(padding)]]), toText(printf("⏳ %s"))(name));
}

function Mocha_runAsyncSequentialTestInBrowser(name, test, padding) {
    let id;
    let copyOfStruct = newGuid();
    id = copyOfStruct;
    return [singleton$2.Delay(() => singleton$2.Bind(sleep(1000), () => singleton$2.Bind(catchAsync(test), (_arg2) => {
        if (_arg2.tag === 1) {
            const err = _arg2.fields[0];
            const div_1 = document.getElementById(id);
            div_1.innerHTML = toText(printf("✘ %s"))(name);
            const error = new Html_Node("div", singleton$1(["style", "margin:10px; padding:10px; border: 1px solid red; border-radius: 10px"]), err.message, empty());
            div_1.setAttribute("style", toText(printf("font-size:16px; padding-left:%dpx;color:red"))(padding));
            div_1.setAttribute("class", "failed");
            div_1.appendChild(Html_createNode(error));
            return singleton$2.Zero();
        }
        else {
            const div = document.getElementById(id);
            div.innerHTML = toText(printf("✔ %s"))(name);
            div.setAttribute("class", "passed");
            div.setAttribute("style", toText(printf("font-size:16px; padding-left:%dpx;color:green"))(padding));
            return singleton$2.Zero();
        }
    }))), Html_simpleDiv(ofArray([["id", id], ["data-test", name], ["class", "executing"], ["style", toText(printf("font-size:16px; padding-left:%dpx;color:gray"))(padding)]]), toText(printf("⏳ %s"))(name))];
}

function Mocha_flattenTests(lastName, _arg1) {
    switch (_arg1.tag) {
        case 1: {
            const test_1 = _arg1.fields[1];
            const state_1 = _arg1.fields[2];
            const name_1 = _arg1.fields[0];
            const modifiedName_1 = isNullOrWhiteSpace(lastName) ? name_1 : toText(printf("%s - %s"))(lastName)(name_1);
            return singleton$1(new TestCase(1, modifiedName_1, test_1, state_1));
        }
        case 2: {
            const tests = _arg1.fields[1];
            const name_2 = _arg1.fields[0];
            return ofSeq(delay(() => collect((test_2) => Mocha_flattenTests(name_2, test_2), tests)));
        }
        case 3: {
            const tests_1 = _arg1.fields[1];
            const name_3 = _arg1.fields[0];
            return ofSeq(delay(() => collect((test_3) => Mocha_flattenTests(name_3, test_3), tests_1)));
        }
        default: {
            const test = _arg1.fields[1];
            const state = _arg1.fields[2];
            const name = _arg1.fields[0];
            const modifiedName = isNullOrWhiteSpace(lastName) ? name : toText(printf("%s - %s"))(lastName)(name);
            return singleton$1(new TestCase(0, modifiedName, test, state));
        }
    }
}

function Mocha_renderBrowserTests(hasFocusedTests, tests, padding) {
    return map$1((_arg1) => {
        switch (_arg1.tag) {
            case 1: {
                const test_1 = _arg1.fields[1];
                const name_1 = _arg1.fields[0];
                const focus_1 = _arg1.fields[2];
                let pattern_matching_result;
                if (focus_1.tag === 0) {
                    if (hasFocusedTests) {
                        pattern_matching_result = 0;
                    }
                    else {
                        pattern_matching_result = 1;
                    }
                }
                else {
                    pattern_matching_result = 1;
                }
                switch (pattern_matching_result) {
                    case 0: {
                        return Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name_1], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to other focused tests"))(name_1));
                    }
                    case 1: {
                        switch (focus_1.tag) {
                            case 1: {
                                return Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name_1], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to it being marked as pending"))(name_1));
                            }
                            case 2: {
                                return Mocha_runAsyncTestInBrowser(name_1, test_1, padding);
                            }
                            default: {
                                return Mocha_runAsyncTestInBrowser(name_1, test_1, padding);
                            }
                        }
                    }
                }
            }
            case 2: {
                const testCases = _arg1.fields[1];
                const name_2 = _arg1.fields[0];
                const tests_1 = Html_div(empty(), Mocha_renderBrowserTests(hasFocusedTests, testCases, padding + 10));
                const header = new Html_Node("div", ofArray([["class", "module"], ["data-module", name_2], ["style", toText(printf("font-size:20px; padding:%dpx"))(padding)]]), name_2, singleton$1(tests_1));
                return Html_div(empty(), singleton$1(header));
            }
            case 3: {
                const testCases_1 = _arg1.fields[1];
                const name_3 = _arg1.fields[0];
                const xs = choose((_arg2) => {
                    switch (_arg2.tag) {
                        case 0: {
                            const testName = _arg2.fields[0];
                            const focusedState = _arg2.fields[2];
                            const actualTest = _arg2.fields[1];
                            let pattern_matching_result_1;
                            if (focusedState.tag === 0) {
                                if (hasFocusedTests) {
                                    pattern_matching_result_1 = 0;
                                }
                                else {
                                    pattern_matching_result_1 = 1;
                                }
                            }
                            else {
                                pattern_matching_result_1 = 1;
                            }
                            switch (pattern_matching_result_1) {
                                case 0: {
                                    const op = singleton$2.Delay(() => singleton$2.Bind(sleep(10), () => singleton$2.Return()));
                                    const result = [op, Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name_3], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to other focused tests"))(name_3))];
                                    return result;
                                }
                                case 1: {
                                    switch (focusedState.tag) {
                                        case 2:
                                        case 0: {
                                            const operation = singleton$2.Delay(() => singleton$2.Bind(sleep(10), () => {
                                                actualTest();
                                                return singleton$2.Zero();
                                            }));
                                            return Mocha_runAsyncSequentialTestInBrowser(testName, operation, padding + 10);
                                        }
                                        default: {
                                            const op_1 = singleton$2.Delay(() => singleton$2.Bind(sleep(10), () => singleton$2.Return()));
                                            const result_1 = [op_1, Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name_3], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to it being marked as pending"))(name_3))];
                                            return result_1;
                                        }
                                    }
                                }
                            }
                        }
                        case 1: {
                            const testName_1 = _arg2.fields[0];
                            const focusedState_1 = _arg2.fields[2];
                            const actualTest_1 = _arg2.fields[1];
                            let pattern_matching_result_2;
                            if (focusedState_1.tag === 0) {
                                if (hasFocusedTests) {
                                    pattern_matching_result_2 = 0;
                                }
                                else {
                                    pattern_matching_result_2 = 1;
                                }
                            }
                            else {
                                pattern_matching_result_2 = 1;
                            }
                            switch (pattern_matching_result_2) {
                                case 0: {
                                    const op_2 = singleton$2.Delay(() => singleton$2.Bind(sleep(10), () => singleton$2.Return()));
                                    const result_2 = [op_2, Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name_3], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to other focused tests"))(name_3))];
                                    return result_2;
                                }
                                case 1: {
                                    switch (focusedState_1.tag) {
                                        case 2:
                                        case 0: {
                                            return Mocha_runAsyncSequentialTestInBrowser(testName_1, actualTest_1, padding + 10);
                                        }
                                        default: {
                                            const op_3 = singleton$2.Delay(() => singleton$2.Bind(sleep(10), () => singleton$2.Return()));
                                            const result_3 = [op_3, Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name_3], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to it being marked as pending"))(name_3))];
                                            return result_3;
                                        }
                                    }
                                }
                            }
                        }
                        default: {
                            return void 0;
                        }
                    }
                }, Mocha_flattenTests("", new TestCase(3, "", testCases_1)));
                const nodes = map$1((tuple) => tuple[1], xs);
                const tests_2 = Html_div(empty(), nodes);
                const header_1 = new Html_Node("div", ofArray([["class", "module"], ["data-module", name_3], ["style", toText(printf("font-size:20px; padding:%dpx"))(padding)]]), name_3, singleton$1(tests_2));
                const asyncOps = map$1((tuple_1) => tuple_1[0], xs);
                startImmediate(ignore(singleton$2.Delay(() => singleton$2.Combine(singleton$2.For(asyncOps, (_arg8) => {
                    const op_4 = _arg8;
                    return singleton$2.Bind(op_4, () => {
                        return singleton$2.Zero();
                    });
                }), singleton$2.Delay(() => singleton$2.Return())))));
                return Html_div(empty(), singleton$1(header_1));
            }
            default: {
                const test = _arg1.fields[1];
                const name = _arg1.fields[0];
                const focus = _arg1.fields[2];
                let pattern_matching_result_3;
                if (focus.tag === 0) {
                    if (hasFocusedTests) {
                        pattern_matching_result_3 = 0;
                    }
                    else {
                        pattern_matching_result_3 = 1;
                    }
                }
                else {
                    pattern_matching_result_3 = 1;
                }
                switch (pattern_matching_result_3) {
                    case 0: {
                        return Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to other focused tests"))(name));
                    }
                    case 1: {
                        switch (focus.tag) {
                            case 1: {
                                return Html_simpleDiv(ofArray([["class", "pending"], ["data-test", name], ["style", toText(printf("font-size:16px; padding-left:%dpx; color:#B8860B"))(padding)]]), toText(printf("🚧 skipping \u0027%s\u0027 due to it being marked as pending"))(name));
                            }
                            case 2: {
                                return Mocha_runSyncTestInBrowser(name, test, padding);
                            }
                            default: {
                                return Mocha_runSyncTestInBrowser(name, test, padding);
                            }
                        }
                    }
                }
            }
        }
    }, tests);
}

function Mocha_configureAsyncTest(test, finished) {
    startImmediate(singleton$2.Delay(() => singleton$2.Bind(catchAsync(test), (_arg1) => {
        if (_arg1.tag === 1) {
            const err = _arg1.fields[0];
            finished(err);
            return singleton$2.Zero();
        }
        else {
            finished();
            return singleton$2.Zero();
        }
    })));
}

function Mocha_invalidateTestResults() {
    startImmediate(singleton$2.Delay(() => {
        const passedCount = (document.getElementsByClassName("passed").length) | 0;
        const failedCount = (document.getElementsByClassName("failed").length) | 0;
        const executingCount = (document.getElementsByClassName("executing").length) | 0;
        const skippedCount = (document.getElementsByClassName("pending").length) | 0;
        const total = (((passedCount + failedCount) + executingCount) + skippedCount) | 0;
        (document.getElementById("total-tests")).innerHTML = toText(printf("Test Results (%d total)"))(total);
        (document.getElementById("passed-tests")).innerHTML = toText(printf("✔ %d passed"))(passedCount);
        (document.getElementById("failed-tests")).innerHTML = toText(printf("✘ %d failed"))(failedCount);
        (document.getElementById("executing-tests")).innerHTML = toText(printf("⏳ %d being executed (async)"))(executingCount);
        (document.getElementById("skipped-tests")).innerHTML = toText(printf("🚧 %d pending"))(skippedCount);
        return (executingCount > 0) ? singleton$2.Bind(sleep(50), () => {
            Mocha_invalidateTestResults();
            return singleton$2.Zero();
        }) : singleton$2.Return();
    }));
}

function Mocha_runViaMocha(test) {
    switch (test.tag) {
        case 1: {
            const test_2 = test.fields[1];
            const msg_1 = test.fields[0];
            const focus_1 = test.fields[2];
            switch (focus_1.tag) {
                case 1: {
                    it.skip(msg_1, ((finished_1) => {
                        Mocha_configureAsyncTest(test_2, finished_1);
                    }));
                    break;
                }
                case 2: {
                    it.only(msg_1, ((finished_2) => {
                        Mocha_configureAsyncTest(test_2, finished_2);
                    }));
                    break;
                }
                default: {
                    it(msg_1, ((finished) => {
                        Mocha_configureAsyncTest(test_2, finished);
                    }));
                }
            }
            break;
        }
        case 2: {
            const testCases = test.fields[1];
            const name = test.fields[0];
            describe(name, () => {
                iterate((test_3) => {
                    Mocha_runViaMocha(test_3);
                }, testCases);
            });
            break;
        }
        case 3: {
            const testCases_1 = test.fields[1];
            const name_1 = test.fields[0];
            describe(name_1, () => {
                iterate((test_4) => {
                    Mocha_runViaMocha(test_4);
                }, testCases_1);
            });
            break;
        }
        default: {
            const test_1 = test.fields[1];
            const msg = test.fields[0];
            const focus = test.fields[2];
            switch (focus.tag) {
                case 1: {
                    it.skip(msg, test_1);
                    break;
                }
                case 2: {
                    it.only(msg, test_1);
                    break;
                }
                default: {
                    it(msg, test_1);
                }
            }
        }
    }
}

function Mocha_runTests(test) {
    if (Env_insideBrowser ? true : (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)) {
        const hasFocusedTests = Mocha_isFocused(test);
        const renderedTests = Mocha_renderBrowserTests(hasFocusedTests, singleton$1(test), 0);
        const testResults = Html_div(singleton$1(["style", "margin-bottom: 20px"]), ofArray([Html_simpleDiv(ofArray([["id", "total-tests"], ["style", "font-size:20px; margin-bottom:5px"]]), "Test Results"), Html_simpleDiv(ofArray([["id", "passed-tests"], ["style", "color:green; margin-left:5px;"]]), "Passed"), Html_simpleDiv(ofArray([["id", "skipped-tests"], ["style", "color:#B8860B"]]), "Pending"), Html_simpleDiv(ofArray([["id", "failed-tests"], ["style", "color:red;margin-left:5px"]]), "Failed"), Html_simpleDiv(ofArray([["id", "executing-tests"], ["style", "color:gray;margin-left:5px"]]), "Executing")]));
        const container = Html_div(singleton$1(["style", "padding:20px;"]), ofSeq(delay(() => append(singleton(testResults), delay(() => renderedTests)))));
        const element = Html_createNode(container);
        (document.body).appendChild(element);
        Mocha_invalidateTestResults();
        return 0;
    }
    else {
        Mocha_runViaMocha(test);
        return 0;
    }
}

function testCasePromise(testName, promise) {
    return Test_testCaseAsync(testName, awaitPromise(promise));
}

class PromiseBuilder {
    constructor() {
    }
}

function PromiseBuilder_$ctor() {
    return new PromiseBuilder();
}

function PromiseBuilder__Delay_62FBFDE1(x, generator) {
    return {
        then: (f1, f2) => {
            try {
                return generator().then(f1, f2);
            }
            catch (er) {
                if (equals(f2, null)) {
                    return Promise.reject(er);
                }
                else {
                    try {
                        return Promise.resolve(f2(er));
                    }
                    catch (er_1) {
                        return Promise.reject(er_1);
                    }
                }
            }
        },
        catch: (f) => {
            try {
                return generator().catch(f);
            }
            catch (er_2) {
                try {
                    return Promise.resolve(f(er_2));
                }
                catch (er_3) {
                    return Promise.reject(er_3);
                }
            }
        },
    };
}

function PromiseBuilder__Run_212F1D4B(x, p) {
    return new Promise(((success, fail) => {
        try {
            const p_1 = Promise.resolve(p);
            p_1.then(success, fail);
        }
        catch (er) {
            fail(er);
        }
    }));
}

const promise = PromiseBuilder_$ctor();

const arithmeticTests = Test_testList("Arithmetic tests", ofArray([Test_testCase("plus works", () => {
    const actual = (1 + 1) | 0;
    const expected = 2;
    const msg = "plus";
    {
        assertEqual(actual, expected, msg);
    }
}), Test_testCase("Test for falsehood", () => {
    Expect_isFalse(1 === 2)("false");
}), Test_testCaseAsync("Test async code", singleton$2.Delay(() => singleton$2.Bind(singleton$2.Delay(() => singleton$2.Return(21)), (_arg1) => {
    const x_1 = _arg1 | 0;
    const answer = (x_1 * 2) | 0;
    const actual_1 = 42;
    const expected_1 = answer | 0;
    const msg_1 = "async";
    if ((actual_1 === expected_1) ? true : (!(new Function("try {return this===window;}catch(e){ return false;}"))())) {
        assertEqual(actual_1, expected_1, msg_1);
    }
    else {
        let valueType_1;
        valueType_1 = int32_type;
        const primitiveTypes_1 = ofArray([int32_type, bool_type, float64_type, string_type, class_type("System.Decimal"), class_type("System.Guid")]);
        let errorMsg_1;
        if (contains(valueType_1, primitiveTypes_1, {
            Equals: equals$1,
            GetHashCode: structuralHash,
        })) {
            const arg20_2 = int32ToString(actual_1);
            const arg10_2 = int32ToString(expected_1);
            errorMsg_1 = toText(printf("\u003cspan style=\u0027color:black\u0027\u003eExpected:\u003c/span\u003e \u003cbr /\u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eActual:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px;color:crimson\u0027\u003e%s\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eMessage:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e"))(arg10_2)(arg20_2)(msg_1);
        }
        else {
            errorMsg_1 = toText(printf("\u003cspan style=\u0027color:black\u0027\u003eExpected:\u003c/span\u003e \u003cbr /\u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%A\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eActual:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px;color:crimson\u0027\u003e%A\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eMessage:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e"))(expected_1)(actual_1)(msg_1);
        }
        throw (new Error(errorMsg_1));
    }
    return singleton$2.Zero();
}))), testCasePromise("Test for promise", PromiseBuilder__Run_212F1D4B(promise, PromiseBuilder__Delay_62FBFDE1(promise, () => (PromiseBuilder__Run_212F1D4B(promise, PromiseBuilder__Delay_62FBFDE1(promise, () => (Promise.resolve(21)))).then(((_arg2) => {
    const x_3 = _arg2 | 0;
    const answer_1 = (x_3 * 2) | 0;
    const actual_2 = 42;
    const expected_2 = answer_1 | 0;
    const msg_2 = "promise";
    if ((actual_2 === expected_2) ? true : (!(new Function("try {return this===window;}catch(e){ return false;}"))())) {
        assertEqual(actual_2, expected_2, msg_2);
    }
    else {
        let valueType_2;
        let copyOfStruct_2 = actual_2 | 0;
        valueType_2 = int32_type;
        const primitiveTypes_2 = ofArray([int32_type, bool_type, float64_type, string_type, class_type("System.Decimal"), class_type("System.Guid")]);
        let errorMsg_2;
        if (contains(valueType_2, primitiveTypes_2, {
            Equals: equals$1,
            GetHashCode: structuralHash,
        })) {
            const arg20_4 = int32ToString(actual_2);
            const arg10_4 = int32ToString(expected_2);
            errorMsg_2 = toText(printf("\u003cspan style=\u0027color:black\u0027\u003eExpected:\u003c/span\u003e \u003cbr /\u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eActual:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px;color:crimson\u0027\u003e%s\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eMessage:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e"))(arg10_4)(arg20_4)(msg_2);
        }
        else {
            errorMsg_2 = toText(printf("\u003cspan style=\u0027color:black\u0027\u003eExpected:\u003c/span\u003e \u003cbr /\u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%A\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eActual:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px;color:crimson\u0027\u003e%A\u003c/div\u003e\u003cbr /\u003e\u003cspan style=\u0027color:black\u0027\u003eMessage:\u003c/span\u003e \u003c/br \u003e\u003cdiv style=\u0027margin-left:20px; color:crimson\u0027\u003e%s\u003c/div\u003e"))(expected_2)(actual_2)(msg_2);
        }
        throw (new Error(errorMsg_2));
    }
    return Promise.resolve();
}))))))]));

(function () {
    const value = Mocha_runTests(arithmeticTests) | 0;
})();

exports.arithmeticTests = arithmeticTests;
