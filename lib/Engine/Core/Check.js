import defined from './Defined';
import DeveloperError from './DeveloperError.js';
/**
 * Contains functions for checking that supplied arguments are of a specified type
 * or meet specified conditions
 */
const Check = {
    typeOf: undefined,
    defined: function (name, test) {
        if (!defined(test) || !defined(name)) {
            throw new Error('Function not implemented.');
        }
    }
};
/**
 * Contains type checking functions, all using the typeof operator
 */
Check.typeOf = {};
function getUndefinedErrorMessage(name) {
    return `${name} is required, actual value was undefined`;
}
function getFailedTypeErrorMessage(actual, expected, name) {
    return `Expected ${name} to be typeof ${expected}, actual typeof was ${actual}`;
}
/**
 * Throws if test is not defined
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value that is to be checked
 * @exception {DeveloperError} test must be defined
 */
Check.defined = function (name, test) {
    if (!defined(test)) {
        throw new DeveloperError(getUndefinedErrorMessage(name));
    }
};
/**
 * Throws if test is not typeof 'function'
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @exception {DeveloperError} test must be typeof 'function'
 */
Check.typeOf.func = function (name, test) {
    if (typeof test !== 'function') {
        throw new DeveloperError(getFailedTypeErrorMessage(typeof test, 'function', name));
    }
};
/**
 * Throws if test is not typeof 'string'
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @exception {DeveloperError} test must be typeof 'string'
 */
Check.typeOf.string = function (name, test) {
    if (typeof test !== 'string') {
        throw new DeveloperError(getFailedTypeErrorMessage(typeof test, 'string', name));
    }
};
/**
 * Throws if test is not typeof 'number'
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @exception {DeveloperError} test must be typeof 'number'
 */
Check.typeOf.number = function (name, test) {
    if (typeof test !== 'number') {
        throw new DeveloperError(getFailedTypeErrorMessage(typeof test, 'number', name));
    }
};
/**
 * Throws if test is not typeof 'number' and less than limit
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @param {number} limit The limit value to compare against
 * @exception {DeveloperError} test must be typeof 'number' and less than limit
 */
Check.typeOf.number.lessThan = function (name, test, limit) {
    Check.typeOf.number(name, test);
    if (test >= limit) {
        throw new DeveloperError(`Expected ${name} to be less than ${limit}, actual value was ${test}`);
    }
};
/**
 * Throws if test is not typeof 'number' and less than or equal to limit
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @param {number} limit The limit value to compare against
 * @exception {DeveloperError} test must be typeof 'number' and less than or equal to limit
 */
Check.typeOf.number.lessThanOrEquals = function (name, test, limit) {
    Check.typeOf.number(name, test);
    if (test > limit) {
        throw new DeveloperError(`Expected ${name} to be less than or equal to ${limit}, actual value was ${test}`);
    }
};
/**
 * Throws if test is not typeof 'number' and greater than limit
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @param {number} limit The limit value to compare against
 * @exception {DeveloperError} test must be typeof 'number' and greater than limit
 */
Check.typeOf.number.greaterThan = function (name, test, limit) {
    Check.typeOf.number(name, test);
    if (test <= limit) {
        throw new DeveloperError(`Expected ${name} to be greater than ${limit}, actual value was ${test}`);
    }
};
/**
 * Throws if test is not typeof 'number' and greater than or equal to limit
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @param {number} limit The limit value to compare against
 * @exception {DeveloperError} test must be typeof 'number' and greater than or equal to limit
 */
Check.typeOf.number.greaterThanOrEquals = function (name, test, limit) {
    Check.typeOf.number(name, test);
    if (test < limit) {
        throw new DeveloperError(`Expected ${name} to be greater than or equal to ${limit}, actual value was ${test}`);
    }
};
/**
 * Throws if test is not typeof 'object'
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @exception {DeveloperError} test must be typeof 'object'
 */
Check.typeOf.object = function (name, test) {
    if (typeof test !== 'object') {
        throw new DeveloperError(getFailedTypeErrorMessage(typeof test, 'object', name));
    }
};
/**
 * Throws if test is not typeof 'boolean'
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @exception {DeveloperError} test must be typeof 'boolean'
 */
Check.typeOf.bool = function (name, test) {
    if (typeof test !== 'boolean') {
        throw new DeveloperError(getFailedTypeErrorMessage(typeof test, 'boolean', name));
    }
};
/**
 * Throws if test is not typeof 'bigint'
 *
 * @param {string} name The name of the variable being tested
 * @param {*} test The value to test
 * @exception {DeveloperError} test must be typeof 'bigint'
 */
Check.typeOf.bigint = function (name, test) {
    if (typeof test !== 'bigint') {
        throw new DeveloperError(getFailedTypeErrorMessage(typeof test, 'bigint', name));
    }
};
/**
 * Throws if test1 and test2 is not typeof 'number' and not equal in value
 *
 * @param {string} name1 The name of the first variable being tested
 * @param {string} name2 The name of the second variable being tested against
 * @param {*} test1 The value to test
 * @param {*} test2 The value to test against
 * @exception {DeveloperError} test1 and test2 should be type of 'number' and be equal in value
 */
Check.typeOf.number.equals = function (name1, name2, test1, test2) {
    Check.typeOf.number(name1, test1);
    Check.typeOf.number(name2, test2);
    if (test1 !== test2) {
        throw new DeveloperError(`${name1} must be equal to ${name2}, the actual values are ${test1} and ${test2}`);
    }
};
export default Check;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvQ2hlY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sY0FBYyxNQUFNLHFCQUFxQixDQUFBO0FBTWhEOzs7R0FHRztBQUNILE1BQU0sS0FBSyxHQUFVO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLE9BQU8sRUFBRSxVQUFVLElBQVMsRUFBRSxJQUFTO1FBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUE7UUFDOUMsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFBO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUVqQixTQUFTLHdCQUF3QixDQUFDLElBQVk7SUFDNUMsT0FBTyxHQUFHLElBQUksMENBQTBDLENBQUE7QUFDMUQsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQ2hDLE1BQWMsRUFDZCxRQUFnQixFQUNoQixJQUFZO0lBRVosT0FBTyxZQUFZLElBQUksaUJBQWlCLFFBQVEsdUJBQXVCLE1BQU0sRUFBRSxDQUFBO0FBQ2pGLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVUsSUFBWSxFQUFFLElBQVM7SUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxjQUFjLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUMxRCxDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsVUFBVSxJ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