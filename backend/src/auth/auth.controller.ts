import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-hospital')
  @ApiOperation({ summary: 'Register Hospital' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password', 'lat', 'long'],
      properties: {
        name: { type: 'string', example: 'City General Hospital' },
        email: { type: 'string', example: 'admin@citygeneral.org' },
        phone: { type: 'string', example: '+2348012345678', nullable: true },
        password: { type: 'string', example: 'StrongPass123!' },
        lat: { type: 'number', example: 6.5244 },
        long: { type: 'number', example: 3.3792 }
      }
    },
    description: 'Creates a hospital admin account.'
  })
  @ApiResponse({ status: 201, description: 'Hospital registered successfully.' })
  register(
    @Body()
    body: { name?: string; email?: string; phone?: string; password?: string; lat?: number; long?: number }
  ) {
    return this.authService.registerHospital(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'admin@citygeneral.org' },
        password: { type: 'string', example: 'StrongPass123!' }
      }
    },
    description: 'Authenticates and returns JWT token.'
  })
  @ApiResponse({ status: 201, description: 'Login successful.' })
  login(@Body() body: { email?: string; password?: string }) {
    return this.authService.login(body);
  }

  @Get('hospitals/me/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get My Hospital Profile' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated hospital admin profile.' })
  getMyProfile(@Req() req: { user?: { hospitalId: number } }) {
    return this.authService.getMyProfile(req.user);
  }

  @Patch('hospitals/me/location')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update My Hospital Location' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['lat', 'long'],
      properties: {
        lat: { type: 'number', example: 6.5244 },
        long: { type: 'number', example: 3.3792 }
      }
    },
    description: 'Updates the authenticated hospital coordinates used for nearest-resource search.'
  })
  @ApiResponse({ status: 200, description: 'Hospital location updated successfully.' })
  updateMyLocation(
    @Body() body: { lat?: number; long?: number },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.authService.updateMyLocation(body, req.user);
  }
}
