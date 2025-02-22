interface Check {
    defined: (name: any, test: any) => void;
    typeOf: any;
}
/**
 * Contains functions for checking that supplied arguments are of a specified type
 * or meet specified conditions
 */
declare const Check: Check;
export default Check;
