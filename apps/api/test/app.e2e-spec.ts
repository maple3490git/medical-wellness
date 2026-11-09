import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import * as bcrypt from "bcrypt";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/prisma/prisma.service";

/**
 * Integration tests against a real PostgreSQL database (DATABASE_URL).
 * Creates uniquely-named test fixtures and cleans them up.
 * Run with: npm run test:e2e (requires DATABASE_URL and migrated schema)
 */
describe("Medical Wellness API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let receptionToken: string;
  let adminId: string;
  let receptionId: string;
  const suffix = Date.now().toString(36);
  const suffixNum = String(Date.now());
  const createdClientIds: string[] = [];
  const createdEmployeeIds: string[] = [];
  const createdAppointmentIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    // Seed ADMIN and RECEPTION users for tests (idempotent by unique suffix emails)
    const adminEmail = `admin-${suffix}@example.local`;
    const receptionEmail = `reception-${suffix}@example.local`;
    const hash = await bcrypt.hash("StrongPass!2026", 4);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        firstName: "Test",
        lastName: "Admin",
        role: "ADMIN",
        active: true,
      },
    });
    const reception = await prisma.user.create({
      data: {
        email: receptionEmail,
        passwordHash: hash,
        firstName: "Test",
        lastName: "Reception",
        role: "RECEPTION",
        active: true,
      },
    });
    adminId = admin.id;
    receptionId = reception.id;

    const loginAdmin = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: adminEmail, password: "StrongPass!2026" })
      .expect(200);
    adminToken = loginAdmin.body.accessToken as string;

    const loginReception = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: receptionEmail, password: "StrongPass!2026" })
      .expect(200);
    receptionToken = loginReception.body.accessToken as string;

    expect(adminToken).toBeTruthy();
    expect(receptionToken).toBeTruthy();
  });

  afterAll(async () => {
    // Clean up test fixtures (order matters due to FK restrict)
    for (const id of createdAppointmentIds) {
      await prisma.appointment.deleteMany({ where: { id } });
    }
    for (const id of createdClientIds) {
      // Clients may still be referenced if appointment deletion failed — use deleteMany to ignore FK errors? Handle gracefully.
      try {
        await prisma.client.deleteMany({ where: { id } });
      } catch {
        /* ignore */
      }
    }
    for (const id of createdEmployeeIds) {
      try {
        await prisma.employee.deleteMany({ where: { id } });
      } catch {
        /* ignore */
      }
    }
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, receptionId] } },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthorized request (no token)", async () => {
    await request(app.getHttpServer()).get("/api/v1/clients").expect(401);
  });

  it("rejects login with wrong password (401)", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: `admin-${suffix}@example.local`,
        password: "WrongPass!2026",
      })
      .expect(401);
  });

  it("forbids RECEPTION from user management (403)", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${receptionToken}`)
      .expect(403);
  });

  it("allows ADMIN to list users", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data).toBeDefined();
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("health endpoint is public", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200);
    expect(["ok", "degraded"]).toContain(res.body.status);
  });

  it("full flow: create client, employee, appointment, overlap, cancel, cancelled does not block", async () => {
    // Create client as RECEPTION
    const clientRes = await request(app.getHttpServer())
      .post("/api/v1/clients")
      .set("Authorization", `Bearer ${receptionToken}`)
      .send({
        firstName: "E2E",
        lastName: `Client${suffix}`,
        phone: `+2126${suffixNum.slice(-8)}`,
        email: `client-${suffix}@example.local`,
      })
      .expect(201);
    const clientId = clientRes.body.id as string;
    createdClientIds.push(clientId);

    // Create employee as RECEPTION (minimum access allowed to create employee? Spec says RECEPTION has minimum client/employee info required.
    // In this MVP, POST /employees is allowed for any authenticated user (no @Roles restriction).
    const empRes = await request(app.getHttpServer())
      .post("/api/v1/employees")
      .set("Authorization", `Bearer ${receptionToken}`)
      .send({ firstName: "E2E", lastName: `Employee${suffix}`, active: true })
      .expect(201);
    const employeeId = empRes.body.id as string;
    createdEmployeeIds.push(employeeId);

    const baseStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const baseEnd = new Date(
      Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
    ).toISOString();

    const aptRes = await request(app.getHttpServer())
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${receptionToken}`)
      .send({
        clientId,
        employeeId,
        startAt: baseStart,
        endAt: baseEnd,
        source: "PHONE",
        status: "SCHEDULED",
      })
      .expect(201);
    const aptId = aptRes.body.id as string;
    createdAppointmentIds.push(aptId);
    expect(aptRes.body.createdById).toBe(receptionId);

    // Overlapping should be 409
    await request(app.getHttpServer())
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${receptionToken}`)
      .send({
        clientId,
        employeeId,
        startAt: baseStart,
        endAt: baseEnd,
        source: "PHONE",
      })
      .expect(409);

    // Invalid date range
    await request(app.getHttpServer())
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${receptionToken}`)
      .send({
        clientId,
        employeeId,
        startAt: baseEnd,
        endAt: baseStart,
        source: "PHONE",
      })
      .expect(400);

    // Cancel then re-create same slot should succeed (cancelled does not block)
    await request(app.getHttpServer())
      .patch(`/api/v1/appointments/${aptId}/cancel`)
      .set("Authorization", `Bearer ${receptionToken}`)
      .send({ reason: "e2e cleanup" })
      .expect(200);

    const apt2Res = await request(app.getHttpServer())
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${receptionToken}`)
      .send({
        clientId,
        employeeId,
        startAt: baseStart,
        endAt: baseEnd,
        source: "PHONE",
      })
      .expect(201);
    createdAppointmentIds.push(apt2Res.body.id as string);

    // Filter by employee
    const listRes = await request(app.getHttpServer())
      .get(`/api/v1/appointments?employeeId=${employeeId}&status=CANCELLED`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(listRes.body.data.some((a: { id: string }) => a.id === aptId)).toBe(
      true,
    );
  });

  it("rejects inactive employee assignment", async () => {
    const empRes = await request(app.getHttpServer())
      .post("/api/v1/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: "Inactive", lastName: `E${suffix}`, active: false })
      .expect(201);
    const employeeId = empRes.body.id as string;
    createdEmployeeIds.push(employeeId);

    const clientRes = await request(app.getHttpServer())
      .post("/api/v1/clients")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstName: "E2E",
        lastName: `InactiveClient${suffix}`,
        phone: `+2126${suffixNum.slice(-8)}`,
      })
      .expect(201);
    createdClientIds.push(clientRes.body.id as string);

    const start = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const end = new Date(
      Date.now() + 48 * 60 * 60 * 1000 + 60 * 60 * 1000,
    ).toISOString();
    await request(app.getHttpServer())
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        clientId: clientRes.body.id,
        employeeId,
        startAt: start,
        endAt: end,
        source: "IN_PERSON",
      })
      .expect(400);
  });
});
