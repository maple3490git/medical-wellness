import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { paginate, parsePagination } from "../common/utils/pagination";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        active: dto.active ?? true,
      },
    });
  }

  async list(pageRaw?: string, limitRaw?: string, activeRaw?: string) {
    const { page, limit } = parsePagination(pageRaw, limitRaw);
    const where: Prisma.EmployeeWhereInput = {};
    if (activeRaw !== undefined && activeRaw !== "") {
      where.active = activeRaw.toLowerCase() === "true";
    }
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);
    return paginate(data, total, { page, limit });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Employee not found");
    }
    const data: Prisma.EmployeeUpdateInput = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) data.lastName = dto.lastName.trim();
    if (dto.active !== undefined) data.active = dto.active;
    return this.prisma.employee.update({ where: { id }, data });
  }
}
