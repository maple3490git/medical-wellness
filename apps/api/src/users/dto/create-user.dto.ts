import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "reception@example.local" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "StrongPass!2026" })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: "Fatima" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: "Benali" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.RECEPTION })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
