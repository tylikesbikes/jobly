"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Duplicate job listings are acceptable, but will all have unique IDs
   * */

  static async create({ title, salary, equity, company_handle }) {
    /** ignoreing duplicateCheck for now since it seems okay to have multiple listings for the same job title within a given company */

    // const duplicateCheck = await db.query(
    //       `SELECT handle
    //        FROM companies
    //        WHERE handle = $1`,
    //     [handle]);

    // if (duplicateCheck.rows[0])
    //   throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle as "companyHandle"`,
        [
          title,
          salary,
          equity,
          company_handle
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filters = {}) {
    /** accepted filters:  title, minSalary, maxSalary, minEquity, maxEquity, companyHandle
    *   if minSalary > maxSalary respond with 404 & a helpful message
    *   if minEquity > maxEquity respond with 404 & a helpful message
    *   title & companyHandle shall be case-sensitive and allow for partial text matching
    */
    const whereClauses = [];
    let whereStatement = '';
    if (filters.hasOwnProperty('title')) {
      whereClauses.push(`lower(title) like '%${filters.title}%'`)
      whereStatement = 'WHERE '
    }
    if (filters.minSalary) {
      whereClauses.push(`salary >= ${filters.minSalary}`)
      whereStatement = 'WHERE '
    }
    if (filters.hasEquity) {
      if (filters.hasEquity === 'true') {
      whereClauses.push(`(equity equity > 0)`)
      whereStatement = 'WHERE '
      
      } else if (filters.hasEquity === 'false') {
        whereClauses.push(`(equity = 0 or equity is null)`)
        whereStatement = 'WHERE '
      }
    }
    if (whereStatement) {
      whereStatement += whereClauses.join(' and ');
    }
    
    const jobsRes = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           ${whereStatement}
           ORDER BY company_handle, title, salary
           `);
    return jobsRes.rows;
  }

  /** Given a job id, return data about the job.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Job;
