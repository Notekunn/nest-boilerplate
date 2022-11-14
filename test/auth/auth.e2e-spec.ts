import * as request from 'supertest'

describe('Auth (e2e)', () => {
  const { API_URL, USER_EMAIL, USER_PASSWORD } = process.env

  it('register', () => {
    return request(API_URL)
      .post('/v1/auth/register')
      .send({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      })
      .expect(201)
  })

  it('login', () => {
    return request(API_URL)
      .post('/v1/auth/login')
      .send({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      })
      .expect(200)
  })
})
