import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

const jwt_payload = {
  'iss': 'Kong',
  'iat': Math.floor(Date.now() / 1000),
  'exp': Math.floor(Date.now() / 1000) + (5 * 60 * 60),
  'aud': '',
  'sub': 'ba5e1308-dd7c-4b11-a4ab-b2305f3b5103',
  'givenname': 'John',
  'surname': 'Doe',
  'email': 'jdoe@kong.com',
  'roles': [],
  'organization_uuid': '7c671f3b-3b1d-49b4-b87b-66bd8e2deb4e'
}

describe('Service Controller (e2e)', () => {
  let app: INestApplication
  let configService: ConfigService
  let rw_token
  let r_token

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    configService = moduleFixture.get<ConfigService>(ConfigService)

    r_token = jwt.sign({
      ...jwt_payload,
      'roles': ['read']
    }, configService.get('JWT_SECRET'))

    rw_token = jwt.sign({
      ...jwt_payload,
      'roles': ['read', 'write']
    }, configService.get('JWT_SECRET'))

    await app.init()
  })

  it('/services (GET) unhautorized request', () => {
    return request(app.getHttpServer())
      .get('/services')
      .expect(401)
  })

  it('/services (GET) with empty database', () => {
    return request(app.getHttpServer())
      .get('/services')
      .set('Authorization', `bearer ${r_token}`)
      .expect(200)
      .expect({
        'items': [],
        'meta': {
          'page': 1,
          'size': 10,
          'item_count': 0,
          'page_count': 0,
          'has_previous_page': false,
          'has_next_page': false
        }
      })
  })

  let createdServiceId: string

  it('/services (POST) create service', () => {
    return request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `bearer ${rw_token}`)
      .send({ 'name': 'Service 1', 'description': 'My service 1 description' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('uuid')

        createdServiceId = res.body.uuid

        expect(res.body.name).toBe('Service 1')
      })
  })

  it('/services (POST) forbidden operation for readonly users', () => {
    return request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `bearer ${r_token}`)
      .send({ 'name': 'Service 1', 'description': 'My service 1 description' })
      .expect(403)
  })

  it('/services (PATCH) forbidden operation for readonly users', () => {
    return request(app.getHttpServer())
      .patch(`/services/${createdServiceId}`)
      .set('Authorization', `bearer ${rw_token}`)
      .send({ 'description': 'My service 1 description updated' })
      .expect(200)
  })

  it('/services/:uuid/versions (POST) create service version', () => {
    return request(app.getHttpServer())
      .post(`/services/${createdServiceId}/versions`)
      .set('Authorization', `bearer ${rw_token}`)
      .send({ 'number': '1.0.0' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('versions')

        expect(res.body.versions[0].number).toBe('1.0.0')
      })
  })

  it('/services/:uuid/versions (POST) prevent versions with the same number', () => {
    return request(app.getHttpServer())
      .post(`/services/${createdServiceId}/versions`)
      .set('Authorization', `bearer ${rw_token}`)
      .send({ 'number': '1.0.0' })
      .expect(400)
  })

  it('/services (GET) get created service', () => {
    return request(app.getHttpServer())
      .get(`/services/${createdServiceId}`)
      .set('Authorization', `bearer ${r_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('uuid')
        expect(res.body.name).toBe('Service 1')
        expect(res.body.description).toBe('My service 1 description updated')
        expect(res.body.versions).toBeUndefined()
      })
  })

  it('/services (GET) 404 for missing services', () => {
    return request(app.getHttpServer())
      .get(`/services/359e0e1e-6e1c-4dd4-abcc-ef1058feb68e`)
      .set('Authorization', `bearer ${r_token}`)
      .expect(404)
  })

  it('/services (GET) get created service with versions', () => {
    return request(app.getHttpServer())
      .get(`/services/${createdServiceId}?versions=true`)
      .set('Authorization', `bearer ${r_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.versions).toHaveLength(1)
      })
  })

  it('/services/:uuid (DELETE) delete a service', () => {
    return request(app.getHttpServer())
      .delete(`/services/${createdServiceId}`)
      .set('Authorization', `bearer ${rw_token}`)
      .expect(200)
  })

  it('/services (GET) database is empty', () => {
    return request(app.getHttpServer())
      .get('/services')
      .set('Authorization', `bearer ${r_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toHaveLength(0)
      })
  })

  it('/services/:id (DELETE) 200 on delete service if already deleted', () => {
    return request(app.getHttpServer())
      .delete(`/services/${createdServiceId}`)
      .set('Authorization', `bearer ${rw_token}`)
      .expect(200)
  })

  afterAll(async () => {
    await app.close()
  })
})
