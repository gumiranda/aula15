require('dotenv').config();
const app = require('../../servertest');
const supertest = require('supertest');

const request = supertest(app);
const mongoose = require('mongoose');

const userData = {
  email: `assasa${new Date().getTime()}@hotmail.com`,
  nome: 'Fausto Silva',
  senha: 'cobrinha',
  senhaConfirmacao: 'cobrinha',
};

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.connection,
      { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
      (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      },
    );
  });

  it('should be able to register', async () => {
    const response = await request.post('/api/user/register').send(userData);
    expect(response.body).toHaveProperty('_id');
    expect(response.status).toBe(201);
  });
});
