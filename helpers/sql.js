const { BadRequestError } = require("../expressError");

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

module.exports = { sqlForPartialUpdate };
