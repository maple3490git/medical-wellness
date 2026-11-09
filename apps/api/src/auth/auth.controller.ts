import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CurrentUser,
  type AuthenticatedUser,
} from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { RolesGuard } from "./guards/roles.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login (JWT)" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 400, description: "Validation error" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Return current authenticated user context" })
  @ApiResponse({ status: 200, description: "Authenticated user" })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user.sub);
  }
}
