"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
const newJob = {
    company_handle: "c1",
    title: 'Spy',
    salary:23456,
    equity:0
  };

  test('create new job, not logged in returns 401', async () => {
    const createJob = await request(app).post('/jobs')
        .send(newJob);

    expect(createJob.statusCode).toEqual(401);
  })

  test('create new job, logged in as regular user returns 401', async () => {
    const createJob = await request(app).post('/jobs')
        .send(newJob)
        .set('authorization',u2Token);

    expect(createJob.statusCode).toEqual(401);
  })

  test('create new job, logged in as admin returns 201 and new job details', async () => {
    const createJob = await request(app).post('/jobs')
    .send(newJob)
    .set('authorization',u1Token);

    expect(createJob.statusCode).toEqual(201);
    expect(createJob.body.job.companyHandle).toEqual('c1');
  })

  

  
});

/************************************** GET /companies */

describe("GET /jobs", function () {
    const newJob = {
        company_handle: "c1",
        title: 'Spy',
        salary:23456,
        equity:0
      };
  test('get jobs works even if not logged in and not an admin user', async () => {
    const jobList = await request(app).get('/jobs');

    expect(jobList.statusCode).toEqual(200);
    expect(jobList.body.jobs.length).toEqual(3);
    expect(jobList.body.jobs[0].title).toEqual('Assassin');
  })

    test('get jobs works with filters', async () => {
        /* testing one filter first */
      let jobList = await request(app).get('/jobs?companyHandle=c1');
  
      expect(jobList.statusCode).toEqual(200);
      expect(jobList.body.jobs.length).toEqual(2);
      
      /* testing two filters */
      jobList = await request(app).get('/jobs?companyHandle=c1&title=C')  //testing for partial string match (C in Scout) AND testing for case-insensitivity here
       expect(jobList.statusCode).toEqual(200);
       expect(jobList.body.jobs.length).toEqual(1);
    //    expect(jobList.body.jobs[0].title).toEqual('Scout');
    })

    test('only an admin user can update a job', async () => {
        const job = await request(app).post('/jobs')
            .send(newJob)
            .set('authorization', u1Token);

        const jobListNoAdmin = await request(app).patch(`/jobs/${job.body.job.id}`)
            .send({title:"NewSpy"})
        expect(jobListNoAdmin.statusCode).toEqual(401);

        const jobListAdmin = await request(app).patch(`/jobs/${job.body.job.id}`)
        .send({title:"NewSpyTitle"})
        .set('authorization',u1Token);
        // console.log('jobListAdminBody*:',jobListAdmin.body.);

        expect(jobListAdmin.statusCode).toEqual(200);
        expect(jobListAdmin.body.job.title).toEqual('NewSpyTitle');
      })

      test('only an admin user can delete a job', async () => {
        const job = await request(app).post('/jobs')
            .send(newJob)
            .set('authorization', u1Token);
        const jobId = job.body.job.id;

        const getJob = await request(app).get(`/jobs/${jobId}`);  //verify job exists
        expect(getJob.body.job.title).toEqual("Spy");

        const deleteJobRegularUser = await request(app).delete(`/jobs/${jobId}`);
        expect(deleteJobRegularUser.statusCode).toEqual(401);

        const deleteJobAdminUser = await request(app).delete(`/jobs/${jobId}`)
            .set('authorization',u1Token);

        expect(deleteJobAdminUser.statusCode).toEqual(200);

      })


});

