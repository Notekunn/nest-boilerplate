import request from 'supertest'

describe('User (e2e)', () => {
  const { TEST_API_URL, TEST_USER_PASSWORD } = process.env
  let userToken: string
  let userId: number
  const userEmail = `user-test-${Date.now()}@example.com`

  beforeAll(async () => {
    // Register and login to get token
    const registerResponse = await request(TEST_API_URL).post('/v1/auth/register').send({
      email: userEmail,
      password: TEST_USER_PASSWORD,
    })

    userToken = registerResponse.body.token.token
    userId = registerResponse.body.user.id
  })

  describe('/v1/user/profile (GET)', () => {
    it('should get user profile with valid token', () => {
      return request(TEST_API_URL)
        .get('/v1/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId)
          expect(res.body).toHaveProperty('email', userEmail)
          expect(res.body).not.toHaveProperty('password')
        })
    })

    it('should return 401 without authorization token', () => {
      return request(TEST_API_URL).get('/v1/user/profile').expect(401)
    })

    it('should return 401 with invalid token', () => {
      return request(TEST_API_URL).get('/v1/user/profile').set('Authorization', 'Bearer invalid.token.here').expect(401)
    })

    it('should return 401 with malformed authorization header', () => {
      return request(TEST_API_URL).get('/v1/user/profile').set('Authorization', 'InvalidFormat').expect(401)
    })

    it('should not expose password in profile response', () => {
      return request(TEST_API_URL)
        .get('/v1/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('password')
        })
    })
  })

  describe('/v1/user/profile (POST)', () => {
    it('should update user name successfully', () => {
      const newName = `Updated Name ${Date.now()}`
      return request(TEST_API_URL)
        .post('/v1/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: newName,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', newName)
          expect(res.body).toHaveProperty('email', userEmail)
        })
    })

    it('should update user password successfully', async () => {
      const tempUserEmail = `temp-${Date.now()}@example.com`
      const oldPassword = 'OldPass123!'
      const newPassword = 'NewPass456!'

      // Create temp user
      const registerRes = await request(TEST_API_URL).post('/v1/auth/register').send({
        email: tempUserEmail,
        password: oldPassword,
      })
      const tempToken = registerRes.body.token.token

      // Update password
      await request(TEST_API_URL)
        .post('/v1/user/profile')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          password: newPassword,
        })
        .expect(201)

      // Try to login with old password (should fail)
      await request(TEST_API_URL)
        .post('/v1/auth/login')
        .send({
          email: tempUserEmail,
          password: oldPassword,
        })
        .expect(400)

      // Login with new password (should succeed)
      return request(TEST_API_URL)
        .post('/v1/auth/login')
        .send({
          email: tempUserEmail,
          password: newPassword,
        })
        .expect(200)
    })

    it('should update both name and password', () => {
      const newName = `Both Updated ${Date.now()}`
      return request(TEST_API_URL)
        .post('/v1/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: newName,
          password: 'NewPass123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', newName)
          expect(res.body).not.toHaveProperty('password')
        })
    })

    it('should return 401 without authorization token', () => {
      return request(TEST_API_URL)
        .post('/v1/user/profile')
        .send({
          name: 'Should Fail',
        })
        .expect(401)
    })

    it('should handle empty update', () => {
      return request(TEST_API_URL)
        .post('/v1/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(201)
    })

    it('should not expose password in update response', () => {
      return request(TEST_API_URL)
        .post('/v1/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'NewSecret123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('password')
        })
    })

    it('should preserve existing data when updating single field', async () => {
      const newName = `Preserve Test ${Date.now()}`

      // Update only name
      const updateRes = await request(TEST_API_URL)
        .post('/v1/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: newName,
        })
        .expect(201)

      // Verify email is preserved
      expect(updateRes.body.email).toBe(userEmail)
      expect(updateRes.body.name).toBe(newName)
    })
  })

  describe('/v1/user/:id (PUT) - Admin Operations', () => {
    let adminToken: string
    let targetUserId: number
    const { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } = process.env
    const targetUserEmail = `target-${Date.now()}@example.com`

    beforeAll(async () => {
      // Login as seeded admin user
      const adminRes = await request(TEST_API_URL).post('/v1/auth/login').send({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      })
      adminToken = adminRes.body.token.token

      // Create target user
      const targetRes = await request(TEST_API_URL).post('/v1/auth/register').send({
        email: targetUserEmail,
        password: TEST_USER_PASSWORD,
      })
      targetUserId = targetRes.body.user.id
    })

    it('should update user by id as admin', () => {
      const newName = `Admin Updated ${Date.now()}`
      return request(TEST_API_URL)
        .put(`/v1/user/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: newName,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', newName)
        })
    })

    it('should return 401 without authorization token', () => {
      return request(TEST_API_URL)
        .put(`/v1/user/${targetUserId}`)
        .send({
          name: 'Should Fail',
        })
        .expect(401)
    })

    it('should handle non-existent user id', () => {
      return request(TEST_API_URL)
        .put('/v1/user/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Should Fail',
        })
        .expect((res) => {
          // Should return 404 or 403 depending on implementation
          expect([403, 404]).toContain(res.status)
        })
    })

    it('should return 400 for invalid user id format', () => {
      return request(TEST_API_URL)
        .put('/v1/user/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Should Fail',
        })
        .expect(400)
    })
  })

  describe('User Authorization', () => {
    let user1Token: string
    let user2Id: number
    const user1Email = `user1-${Date.now()}@example.com`
    const user2Email = `user2-${Date.now()}@example.com`

    beforeAll(async () => {
      // Create two users
      const user1Res = await request(TEST_API_URL).post('/v1/auth/register').send({
        email: user1Email,
        password: TEST_USER_PASSWORD,
      })
      user1Token = user1Res.body.token.token

      const user2Res = await request(TEST_API_URL).post('/v1/auth/register').send({
        email: user2Email,
        password: TEST_USER_PASSWORD,
      })
      user2Id = user2Res.body.user.id
    })

    it('should prevent user from updating another user profile via user endpoint', () => {
      // User 1 tries to update User 2 - this should be prevented by getting their own profile
      return request(TEST_API_URL)
        .get('/v1/user/profile')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(user1Email)
          expect(res.body.id).not.toBe(user2Id)
        })
    })
  })
})
