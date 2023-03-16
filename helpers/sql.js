const { BadRequestError, ExpressError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  /* **
    dataToUpdate is an object with keys you want to send to a SQL query to update in the db.  The key names will generally be in 
    camelCase as if they're modeled after json objects.
      ex:  {firstName: 'Bob', lastName:'Marley'}

    jsToSql is another object used to convert KEY names from dataToUpdate into sql-query-friendly names as the values.
      ex:  {firstName: 'first_name', lastName: 'last_name'}
      
    Returns an object containing a {setCols: string, values: array}
     the string value for setCols = converted names and SQL placeholders (e.g.:  "first_name = $1, last_name = $2")
     the array values = the values to be inserted into the placeholders $1, $2 etc. (e.g. ['Bob','Marley'])
  */
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data"); // if dataToUpdate is empty, throw error

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>  // second argument in the callback function for .map() returns the index of the array for each iteration
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function getWhereStatementFilters(args) {
  /**
   * get minEmployeees, maxEmployees, and name from query string;
   * name will be converted to lowercase because the /companies route is supposed to search in a case-insensitive way
   * convert minEmployees & maxEmployees to numbers when they're present.
   * if minEmployees > maxEmployees return 400
   * 
   * ignore any querystring arguments not called minEmployees, maxEmployees, or name.  return an object
   * with the relevant query string properties
   */
  if ((args['minEmployees'] && args['maxEmployees']) && args['minEmployees'] > args['maxEmployees']) {
    throw new ExpressError('minEmployees must be less than or equal to maxEmployees', 400);
  }
  const filters = {};
  if (args['name']) {
    filters.name = args['name'].toLowerCase();
  }
  if (args['minEmployees']) {
    filters.minEmployees = +args['minEmployees'];
  }
  if (args['maxEmployees']) {
    filters.maxEmployees = +args['maxEmployees'];
  }
  return filters;
}

module.exports = { sqlForPartialUpdate, getWhereStatementFilters };
