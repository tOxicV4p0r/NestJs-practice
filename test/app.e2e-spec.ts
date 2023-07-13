import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {

  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@gmail.com',
      password: '1234',
    }

    describe('Sign up', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw if no data', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
    });

    describe('Sign in', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .expectJsonLike({ access_token: "typeof $V === 'string'" })
          .stores('userAt', 'access_token');
      });


      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw if no data', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLike({
            id: "typeof $V === 'number'",
            email: "typeof $V === 'string'",
          });
      });
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        lastName: "HelloLastName",
        firstName: "firstName",
        // email: "hello@sdfdsfa.com",
      }

      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
      })

    });

  });

  describe('Bookmarks', () => {
    describe('Get empty bookmark', () => {
      it('should get bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .expectBody([])
          .inspect();
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: "First Bookmark",
        link: "https://www.coursehero.com/file/72527136/INTRODUCTION-TO-COMPUTER-PROGRAMMINGpdf/"
      }

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it("should get bookmark by Id", () => {
        return pactum
          .spec()
          .get("/bookmarks/{id}")
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .inspect();
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: "Edit Bookmark",
        link: "https://www.coursehero.com/file/72527136"
      }

      it('should update bookmark by id', () => {
        return pactum
          .spec()
          .patch("/bookmarks/{id}")
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
      });

    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete("/bookmarks/{id}")
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(204);
      });

      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .expectBody([])
          .expectJsonLength(0);
      });

    });

  });
});