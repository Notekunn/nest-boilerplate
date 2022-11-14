import * as request from 'supertest'

describe('AppController (e2e)', () => {
  const apiURL = process.env.API_URL

  it('/v1/healthz (GET)', () => {
    return request(apiURL).get('/v1/healthz').expect(200)
  })
})
