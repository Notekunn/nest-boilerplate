import request from 'supertest'

describe('Auth (e2e)', () => {
  const { API_URL, USER_PASSWORD } = process.env
  const uniqueEmail = `test-${Date.now()}@example.com`

  describe('/v1/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      return request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: USER_PASSWORD,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user')
          expect(res.body).toHaveProperty('token')
          expect(res.body.user).toHaveProperty('email', uniqueEmail)
          expect(res.body.user).toHaveProperty('id')
          expect(res.body.token).toHaveProperty('token')
          expect(res.body.token).toHaveProperty('expiresIn')
        })
    })

    it('should return 409 when registering with existing email', async () => {
      // First registration
      await request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: `duplicate-${Date.now()}@example.com`,
          password: USER_PASSWORD,
        })

      // Attempt duplicate registration
      return request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: `duplicate-${Date.now()}@example.com`,
          password: USER_PASSWORD,
        })
        .expect(409)
    })

    it('should return 400 for invalid email format', () => {
      return request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: USER_PASSWORD,
        })
        .expect(400)
    })

    it('should return 400 when email is missing', () => {
      return request(API_URL)
        .post('/v1/auth/register')
        .send({
          password: USER_PASSWORD,
        })
        .expect(400)
    })

    it('should return 400 when password is missing', () => {
      return request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
        })
        .expect(400)
    })

    it('should not expose password in response', () => {
      return request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: `no-password-${Date.now()}@example.com`,
          password: USER_PASSWORD,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user).not.toHaveProperty('password')
        })
    })
  })

  describe('/v1/auth/login (POST)', () => {
    const loginEmail = `login-${Date.now()}@example.com`

    beforeAll(async () => {
      // Create user for login tests
      await request(API_URL).post('/v1/auth/register').send({
        email: loginEmail,
        password: USER_PASSWORD,
      })
    })

    it('should login successfully with correct credentials', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: loginEmail,
          password: USER_PASSWORD,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user')
          expect(res.body).toHaveProperty('token')
          expect(res.body.user).toHaveProperty('email', loginEmail)
          expect(res.body.token).toHaveProperty('token')
          expect(res.body.token.token).toBeTruthy()
        })
    })

    it('should return 400 for incorrect password', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        })
        .expect(400)
    })

    it('should return 400 for non-existent user', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: USER_PASSWORD,
        })
        .expect(400)
    })

    it('should return 400 for invalid email format', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: USER_PASSWORD,
        })
        .expect(400)
    })

    it('should return 400 when email is missing', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          password: USER_PASSWORD,
        })
        .expect(400)
    })

    it('should return 400 when password is missing', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: loginEmail,
        })
        .expect(400)
    })

    it('should not expose password in response', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: loginEmail,
          password: USER_PASSWORD,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user).not.toHaveProperty('password')
        })
    })

    it('should return valid JWT token structure', () => {
      return request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: loginEmail,
          password: USER_PASSWORD,
        })
        .expect(200)
        .expect((res) => {
          const token = res.body.token.token
          expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
        })
    })
  })
})
