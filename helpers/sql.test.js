const {sqlForPartialUpdate, getWhereStatementFilters} = require('./sql');
const app = require('../app')
const request = require('supertest');
const db = require('../db');

describe ('sqlForPartialUpdate Function', () => {
    test('output is as expected with two parameters', () => {
        const output = sqlForPartialUpdate({firstName:'Bob', lastName:'Marley'}, {firstName:'first_name', lastName:'last_name'});

        expect(output).toEqual({
            setCols:`"first_name"=$1, "last_name"=$2`,
            values:['Bob','Marley']
        })
    })

    test('output is as expected with four parameters', () => {
        const output = sqlForPartialUpdate(
            {firstName:'Bob', lastName:'Marley', famousFor:'music', genre:'reggae'}, 
            {firstName:'first_name', lastName:'last_name', famousFor:'famous_for', genre:'genre'});

        expect(output).toEqual({
            setCols:`"first_name"=$1, "last_name"=$2, "famous_for"=$3, "genre"=$4`, 
            values:['Bob','Marley','music','reggae']
        })
    })

    test('you can leave off some values if they don\'t need to be renamed for sql', () => {
        const output = sqlForPartialUpdate(
            {firstName:'Bob', lastName:'Marley', famousFor:'music', genre:'reggae'}, 
            {firstName:'first_name', lastName:'last_name', famousFor:'famous_for'});

        expect(output).toEqual({
            setCols:`"first_name"=$1, "last_name"=$2, "famous_for"=$3, "genre"=$4`, 
            values:['Bob','Marley','music','reggae']
        })
    })
})

describe('basics of getWhereStatementFilters function', () => {
    test('getWhereStatementFilters ignores invalid values in the object passed to it', () => {
        const res = getWhereStatementFilters({minEmployees:900, maxEmployees:990, asdf:'bad key/value pair'})
        expect(res).toEqual({maxEmployees:990, minEmployees:900})
    })

    test('minEmployees > maxEmployees returns a 400 error', async () => {
        const res = await request(app).get('/companies?minEmployees=500&maxEmployees=400');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toEqual('minEmployees must be less than or equal to maxEmployees')

    })

    // test('filter for minEmployees works on its own', async () => {
    //     const res = await request(app).get('/companies?minEmployees=500');
    //     expect(res.statusCode).toEqual(200);
    //     console.log(res);
    //     expect(res.body.companies.length).toBeGreaterThan(0);
    // })

    test('getWhereStatementFilters function ignores invalid keys and returns all strings in lowercase', () =>{
        const res = getWhereStatementFilters({name:'Tyler', minEmployees:'345', invalidKey:'ignore me'})
        expect(res).toEqual({name:'tyler',minEmployees:345})
    })

    test('/companies returns correct results regardless of which order query string arguments are supplied in', async () => {
        // const res1 = await request(app).get('/companies?name=1&minEmployees=2');
        const res1 = await request(app).get('/companies?minEmployees=2&name=3');
        const res2 = await request(app).get('/companies?name=3&minEmployees=2');

        expect(res1.body.companies).toEqual(res2.body.companies);
    })
})

afterAll(async () =>{
    await db.end();
})