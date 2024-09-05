import {
	Injectable,
	CanActivate, 
	ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
	constructor (
		private readonly userService: UsersService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		
		if (!request.session || !request.session.userId) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
	
		const user = await this.userService.findById(request.session.userId);
		request.user = user;

		return true;
	}
}