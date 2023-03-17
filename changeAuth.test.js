const request = require('supertest');
const app = require('./app');
const jwt  = require('jsonwebtoken');
const user = require('./models/user');
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token
  } = require("./routes/_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);


describe('permissions for getting list of users, getting individual user info, updating and deleting user info',() => {
    test('don\'t have to be logged in / admin to register new user', async () => {
        const newUser = await request(app)
            .post('/auth/register')
                .send({
                    username:'TestAddUserAnybody',
                    password:'password',
                    firstName:'TestAdd',
                    lastName:'UserAnybody',
                    email:'b@c.do'
                })
        
        expect(newUser.statusCode).toEqual(201);
        expect(newUser.body.token).toEqual(expect.any(String))
    })

    test('new user isAdmin = false by default', async () => {
        const newUser = await request(app)
        .post('/auth/register')
            .send({
                username:'TestAddUserAnybody',
                password:'password',
                firstName:'TestAdd',
                lastName:'UserAnybody',
                email:'b@c.do'
            })

        const newUserTokenInfo = await jwt.decode(newUser.body.token);

        expect(newUserTokenInfo.isAdmin).toEqual(false);
    })

    test('non-admin or non-logged-in user cannot view someone else\'s user info', async () => {
        const viewUserInfo = await request(app).get('/users/u2');
        expect(viewUserInfo.body.error.message).toEqual('Unauthorized');
    })
    test('logged in admin user can view someone else\'s user info', async () => {
        const viewUserInfo = await request(app).get('/users/u2').set('authorization',u1Token);
        expect(viewUserInfo.body.user.username).toEqual('u2');
    })

    test('u2 is not an admin so can\t see u3 info, but CAN see their own info', async () => {
        const u2ViewingU3Info = await request(app).get('/users/u3').set('authorization',u2Token)

        expect(u2ViewingU3Info.body.error.message).toEqual('Unauthorized');
        
        const u2ViewingU2Info = await request(app).get('/users/u2').set('authorization',u2Token)
        console.log()
        expect(u2ViewingU2Info.body.user.username).toEqual('u2');
    })

    test('u1 can update u3 info because theyre an admin, but u2 cannot', async () => {
        const u1UpdatingU3 = await request(app)
            .patch('/users/u3')
            .send({email:'updated@email.addr'})
            .set('authorization',u1Token);

        const updatedU3 = await request(app).get('/users/u3').set('authorization',u1Token);

        expect(updatedU3.body.user.email).toEqual('updated@email.addr');

        const u2UpdatingU3 = await request(app)
            .patch('/users/u3')
            .send({email:'user2Update@e.a'})
            .set('authorization',u2Token);

        expect(u2UpdatingU3.body.error.message).toEqual('Unauthorized');

    })

})