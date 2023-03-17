"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
      console.log()
    } 
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureLoggedInAdmin(req, res, next) {
  /**
   * ensure the user is logged in and has admin privileges
   */
  try {
    // if (typeof res.locals.user === undefined) {throw new UnauthorizedError()};
    // if (typeof res.locals.user.isAdmin !== undefined && !res.locals.user.isAdmin) throw new UnauthorizedError();
    if (!res.locals.user) {
      throw new UnauthorizedError();
    } else {
      if (!res.locals.user.isAdmin) {
        throw new UnauthorizedError();
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectUser(req, res, next) {
  /**
   *  ensure the user is either logged in as an admin OR the logged in username = the username they're 
   * trying to view/patch/delete 
   */
  try {
    if (!res.locals.user) {throw new UnauthorizedError();}
    if (res.locals.user.isAdmin || (res.locals.user.username === req.params.username)) {return next();}
    else throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureLoggedInAdmin,
  ensureCorrectUser
};
