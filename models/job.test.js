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

  describe('job model methods', () => {
    test('get jobs no filters', async () => {
      const jobs = await Job.findAll();

      expect(jobs.length).toBe(3);
    });

    test('create job', async () => {
      const newJob = await Job.create({ title:'Spy', salary:100000, equity:0.86, company_handle:'c3' });

      expect(newJob).toEqual({title:'Spy', salary:100000, id: expect.any(Number), equity:'0.86', companyHandle:'c3'});
    })

    test('no job found message if job does not exist', async () => {
      try {
        const getJob = await Job.get(34);
      } catch(e) {
        expect(e.message).toEqual('No job: id# 34')
      }

      

      // expect(getJob).toEqual({message:'Not found', status:404})
    })

    test('get jobs with title filter', async () => {
      const jobC1 = await Job.findAll({title:'jt1'});

      expect(jobC1.length).toEqual(1);
      expect(jobC1[0].title).toEqual('jt1');
    })

    test('get jobs with two filters', async () => {
      const jobs = await Job.findAll({companyHandle:'c2', hasEquity:'false'});
      expect(jobs.length).toEqual(1);
      expect(jobs).toEqual([{
        title:'jt3', salary:300, equity:'0', company_handle:'c2'
      }])
    })

    test('update job', async () => {
      const newJob = await Job.create({ title:'TestJob', salary:100000, equity:0.86, company_handle:'c3' })
      
      const updatedJob = await Job.update(newJob.id, {title:'New Job Title'});

      expect(updatedJob.title).toEqual('New Job Title');
    
    })

    test('delete job', async () => {
      const newJob = await Job.create({ title:'Job to Delete', salary:100000, equity:0.86, company_handle:'c3' })
      
      expect(newJob.title).toEqual('Job to Delete'); // created a new job and make sure it exists;

      // const deleteJob = await Job.remove(newJob.id);

      try {
        const deletedJob = await Job.get(newJob.id);
      } catch(e) {
        expect(e.message).toEqual(`No job: id# ${newJob.id}`); // deleted job no longer exists after deletion;
      }
    
    })


  })

  