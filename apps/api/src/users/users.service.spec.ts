import { ConflictException } from "@nestjs/common";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  it("creates user and never returns password hash", async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: "u1",
          email: "r@example.local",
          role: "RECEPTION",
        }),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    const service = new UsersService(prisma as never);
    const result = await service.create({
      email: "R@Example.Local",
      password: "StrongPass!2026",
      firstName: "R",
      lastName: "S",
      role: "RECEPTION",
    } as never);
    expect(result).toEqual({
      id: "u1",
      email: "r@example.local",
      role: "RECEPTION",
    });
    const createArg = prisma.user.create.mock.calls[0][0];
    expect(createArg.data.passwordHash).toBeDefined();
    expect(createArg.data.passwordHash).not.toBe("StrongPass!2026");
    expect(createArg.select).not.toHaveProperty("passwordHash");
  });

  it("rejects duplicate email", async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: "existing" }),
        create: jest.fn(),
      },
    };
    const service = new UsersService(prisma as never);
    await expect(
      service.create({
        email: "r@example.local",
        password: "StrongPass!2026",
        firstName: "R",
        lastName: "S",
        role: "RECEPTION",
      } as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
