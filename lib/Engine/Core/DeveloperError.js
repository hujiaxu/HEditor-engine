import Defined from './Defined';
export default class DeveloperError {
    message;
    stack;
    name = 'DeveloperError';
    constructor(message) {
        this.message = message;
        /**
         * The explanation for why this exception was thrown.
         * @type {string}
         * @readonly
         */
        this.message = message;
        // Browsers such as IE don't have a stack property until you actually throw the error.
        let stack;
        try {
            throw new Error();
        }
        catch (e) {
            stack = e.stack;
        }
        /**
         * The stack trace of this exception, if available.
         * @type {string}
         * @readonly
         */
        this.stack = stack;
    }
    throwInstantiationError() {
        throw new DeveloperError('This function defines an interface and should not be called directly.');
    }
}
if (Defined(Object.create)) {
    // DeveloperError.prototype = Object.create(Error.prototype)
    DeveloperError.prototype.constructor = DeveloperError;
}
DeveloperError.prototype.toString = function () {
    let str = `${this.name}: ${this.message}`;
    if (Defined(this.stack)) {
        str += `\n${this.stack.toString()}`;
    }
    return str;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2ZWxvcGVyRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvRGV2ZWxvcGVyRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBRS9CLE1BQU0sQ0FBQyxPQUFPLE9BQU8sY0FBYztJQUNqQyxPQUFPLENBQVE7SUFDZixLQUFLLENBQW9CO0lBQ2hCLElBQUksR0FBVyxnQkFBZ0IsQ0FBQTtJQUN4QyxZQUFZLE9BQWU7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFFdEI7Ozs7V0FJRztRQUNILElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBRXRCLHNGQUFzRjtRQUN0RixJQUFJLEtBQUssQ0FBQTtRQUNULElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTtRQUNuQixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLEtBQUssR0FBSSxDQUFXLENBQUMsS0FBSyxDQUFBO1FBQzVCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7SUFDcEIsQ0FBQztJQUVELHVCQUF1QjtRQUNyQixNQUFNLElBQUksY0FBYyxDQUN0Qix1RUFBdUUsQ0FDeEUsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQUVELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzNCLDREQUE0RDtJQUM1RCxjQUFjLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUE7QUFDdkQsQ0FBQztBQUVELGNBQWMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHO0lBQ2xDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7SUFFekMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDeEIsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFBO0lBQ3JDLENBQUM7SUFFRCxPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUMsQ0FBQSJ9