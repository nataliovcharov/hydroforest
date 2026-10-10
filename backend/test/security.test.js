// Tests for the security fixes: data exposure, input validation, rate limiting and headers.
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { createApp } = require('../app');
const User = require('../database/User');

chai.use(chaiHttp);
const { expect } = chai;

const stamp = Date.now();
const people = {
  me: { username: `sec_me_${stamp}`, email: `sec_me_${stamp}@test.com`, password: 'secret1' },
  friend: { username: `sec_friend_${stamp}`, email: `sec_friend_${stamp}@test.com`, password: 'secret1' },
  stranger: { username: `sec_stranger_${stamp}`, email: `sec_stranger_${stamp}@test.com`, password: 'secret1' },
};
const tokens = {};
const ids = {};

const request = () => chai.request(app);
const authed = (method, path, who = 'me') => request()[method](path).set('Authorization', `Bearer ${tokens[who]}`);

describe('Security', () => {
  before(async () => {
    for (const [key, person] of Object.entries(people)) {
      const res = await request().post('/api/auth/signup').send(person);
      expect(res).to.have.status(200);
      tokens[key] = res.body.token;
      ids[key] = String((await User.findOne({ username: person.username }))._id);
    }
    const res = await authed('post', '/api/social/add').send({ friendId: ids.friend });
    expect(res).to.have.status(200);
  });

  after(async () => {
    await User.deleteMany({ username: { $in: Object.values(people).map((p) => p.username) } });
  });

  describe('no private data leaves the API', () => {
    it('the old public user list is gone', async () => {
      const res = await request().get('/api/users');
      expect(res).to.have.status(404);
      expect(res.body).to.deep.equal({ success: false, message: 'Not found' });
    });

    it('/api/auth/me never includes the password hash', async () => {
      const res = await authed('get', '/api/auth/me');
      expect(res).to.have.status(200);
      expect(res.body.user).to.not.have.property('password');
    });

    it('friend search only returns public fields', async () => {
      const res = await authed('get', `/api/social/suggestions?q=sec_stranger`);
      expect(res).to.have.status(200);
      expect(res.body.suggestions).to.have.lengthOf(1);
      expect(Object.keys(res.body.suggestions[0]).sort()).to.deep.equal(['_id', 'totalWaterLogged', 'username']);
    });

    it('friend search leaves out yourself and people who are already friends', async () => {
      const res = await authed('get', `/api/social/suggestions?q=sec_`);
      const names = res.body.suggestions.map((u) => u.username);
      expect(names).to.include(people.stranger.username);
      expect(names).to.not.include(people.me.username);
      expect(names).to.not.include(people.friend.username);
    });

    it('friend search treats regex characters as plain text', async () => {
      const res = await authed('get', '/api/social/suggestions?q=.*');
      expect(res).to.have.status(200);
      expect(res.body.suggestions).to.have.lengthOf(0);
    });

    it('the friends list and leaderboard hide emails and passwords', async () => {
      const friends = await authed('get', '/api/social');
      const board = await authed('get', '/api/leaderboard');
      for (const person of [...friends.body.friends, ...board.body.leaderboard]) {
        expect(person).to.not.have.property('password');
        expect(person).to.not.have.property('email');
      }
    });
  });

  describe('input is validated', () => {
    it('rejects a MongoDB operator sent as the username', async () => {
      const res = await request().post('/api/auth/login').send({ username: { $ne: null }, password: 'x' });
      expect(res).to.have.status(400);
    });

    it('gives the same answer for an unknown user and a wrong password', async () => {
      const unknown = await request().post('/api/auth/login').send({ username: 'nobody_here', password: 'secret1' });
      const wrong = await request().post('/api/auth/login').send({ username: people.me.username, password: 'nope123' });
      expect(unknown.status).to.equal(wrong.status);
      expect(unknown.body.message).to.equal(wrong.body.message);
    });

    it('rejects usernames with unusual characters', async () => {
      const res = await request()
        .post('/api/auth/signup')
        .send({ username: 'bad name!', email: `bad_${stamp}@test.com`, password: 'secret1' });
      expect(res).to.have.status(400);
    });

    it('stores signup emails in lowercase', async () => {
      const username = `sec_case_${stamp}`;
      const res = await request()
        .post('/api/auth/signup')
        .send({ username, email: `MiXeD_${stamp}@Test.com`, password: 'secret1' });
      expect(res).to.have.status(200);
      expect((await User.findOne({ username })).email).to.equal(`mixed_${stamp}@test.com`);
      await User.deleteOne({ username });
    });

    it("won't let you add yourself as a friend", async () => {
      const res = await authed('post', '/api/social/add').send({ friendId: ids.me });
      expect(res).to.have.status(400);
    });

    it('rejects a friend id that is not a valid id', async () => {
      const res = await authed('post', '/api/social/add').send({ friendId: { $gt: '' } });
      expect(res).to.have.status(400);
    });

    it('adding the same friend twice keeps one entry', async () => {
      await authed('post', '/api/social/add').send({ friendId: ids.friend });
      const res = await authed('get', '/api/social');
      expect(res.body.friends.filter((f) => f._id === ids.friend)).to.have.lengthOf(1);
    });

    it('caps how much water one request can log', async () => {
      const res = await authed('post', '/api/Home/log-water').send({ amount: 99999 });
      expect(res).to.have.status(400);
    });

    it('only accepts true or false for notifications', async () => {
      const res = await authed('post', '/api/MyAccount/account/notifications').send({ notificationsEnabled: 'yes' });
      expect(res).to.have.status(400);
    });

    it('needs a login before validating account changes', async () => {
      const res = await request().post('/api/ChangeEmail/change-email').send({});
      expect(res).to.have.status(401);
    });

    it('rejects request bodies over 10 kB', async () => {
      const res = await request()
        .post('/api/auth/login')
        .send({ username: 'x'.repeat(20000), password: 'x' });
      expect(res).to.have.status(413);
    });
  });

  describe('protection against abuse', () => {
    it('rate-limits login attempts', async () => {
      const limited = createApp({ authRateLimit: 2 });
      const attempt = () => chai.request(limited).post('/api/auth/login').send({ username: 'nobody', password: 'x' });
      expect((await attempt()).status).to.equal(400);
      expect((await attempt()).status).to.equal(400);
      const blocked = await attempt();
      expect(blocked).to.have.status(429);
      expect(blocked.body.message).to.match(/too many attempts/i);
    });

    it('sends security headers', async () => {
      const res = await request().get('/api/trees');
      expect(res).to.have.header('x-content-type-options', 'nosniff');
      expect(res).to.not.have.header('x-powered-by');
    });

    it('only allows CORS from the frontend', async () => {
      const allowed = await request().get('/api/trees').set('Origin', 'http://localhost:3000');
      const blocked = await request().get('/api/trees').set('Origin', 'https://evil.example');
      expect(allowed).to.have.header('access-control-allow-origin', 'http://localhost:3000');
      expect(blocked).to.not.have.header('access-control-allow-origin');
    });
  });
});
