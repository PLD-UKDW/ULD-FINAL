# BFF (Backend-for-Frontend) Notes — Local BFF inside Next.js

This project is configured to run a simple BFF inside the Next.js app using `app/api/*` routes so frontend and backend run on the same port.

Key points

- API routes for berita live under `app/api/berita/*` and mirror the original Express routes.
- Admin routes also live under `app/api/admin/*` and replace the old Express admin router.
- File uploads are handled by the API service and saved to `uploads/berita` (requires Node runtime).
- The API route files that do filesystem work export `export const runtime = 'nodejs'` to ensure they run on Node.

Admin route map

- `GET /api/admin/tests` and `POST /api/admin/tests` -> `app/api/admin/tests/route.ts`
- `GET /api/admin/tests/:testId` and `DELETE /api/admin/tests/:testId` -> `app/api/admin/tests/[testId]/route.ts`
- `POST /api/admin/tests/:testId/questions` and `DELETE /api/admin/tests/:testId/questions` -> `app/api/admin/tests/[testId]/questions/route.ts`
- `PUT /api/admin/questions/:questionId` and `DELETE /api/admin/questions/:questionId` -> `app/api/admin/questions/[questionId]/route.ts`
- `GET /api/admin/attempts` -> `app/api/admin/attempts/route.ts`
- `GET /api/admin/attempts/:attemptId` -> `app/api/admin/attempts/[attemptId]/route.ts`
- `POST /api/admin/attempts/:attemptId/score` -> `app/api/admin/attempts/[attemptId]/score/route.ts`
- `POST /api/admin/attempts/:attemptId/status` -> `app/api/admin/attempts/[attemptId]/status/route.ts`
- `POST /api/admin/attempts/:attemptId/essay-score` -> `app/api/admin/attempts/[attemptId]/essay-score/route.ts`
- `POST /api/admin/attempts/:attemptId/mc-score` -> `app/api/admin/attempts/[attemptId]/mc-score/route.ts`

Run locally

Development:

```bash
npm run dev
```

Production (build + start):

```bash
npm run build
npm run start
```

Quick curl examples

- Create berita (multipart/form-data, admin token required):

```bash
curl -X POST http://localhost:3000/api/berita \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -F "title=Test Berita" \
  -F "content=Hello world" \
  -F "categoryId=1" \
  -F "content_images=@./test-image.jpg"
```

- Update berita (multipart):

```bash
curl -X PUT http://localhost:3000/api/berita/update/123 \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -F "title=Updated title" \
  -F "content_images=@./new.jpg"
```

- Publish / Unpublish:

```bash
curl -X PUT http://localhost:3000/api/berita/publish/123 -H "Authorization: Bearer <ADMIN_JWT>"
curl -X PUT http://localhost:3000/api/berita/unpublish/123 -H "Authorization: Bearer <ADMIN_JWT>"
```

- Delete:

```bash
curl -X DELETE http://localhost:3000/api/berita/delete/123 -H "Authorization: Bearer <ADMIN_JWT>"
```

- Public listing:

```bash
curl http://localhost:3000/api/berita
```

Auth

- The API helpers read the `Authorization: Bearer <token>` header or a cookie; the `lib/auth.ts` file decodes JWT payloads without external dependencies to extract user role. Replace with proper token verification in production.

Production deployment notes

- Writing uploaded files to local disk is only suitable when you host Next.js on a Node server instance (single VM or container). If you deploy to serverless platforms (Vercel Serverless, Edge), local disk writes are ephemeral or unavailable.
- This project now uses Prisma 7 with MariaDB/MySQL support. Set `DATABASE_URL` before running `npx prisma generate`, `npm run build`, or `npm run db:seed`.
- Recommended production approach for this project:
  - Keep the backend inside Next.js `app/api/*`.
  - Save uploads under `public/uploads/*` so files are served from `/uploads/*`.

Seed
- Generate the Prisma client:
```bash
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/uld" npx prisma generate
```
- Seed the database:
```bash
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/uld" npm run db:seed
```

If you want, I can add a small client upload component or implement S3 signed-URL flow next.
