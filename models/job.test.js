'use strict';

const db  = require('../db');
const Job = require('./job')

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);


  describe('JOB TEST SUITE 1', () => {
    test('get jobs', async () => {
      const jobs = await Job.findAll();

      expect(jobs.length).toBe(2);
    })
  })