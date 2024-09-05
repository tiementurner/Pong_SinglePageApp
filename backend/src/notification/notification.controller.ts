import { Controller, Get, Param, Delete, UseGuards, ParseIntPipe } from "@nestjs/common";
// import { UserSession } from "src/auth/auth.controller";
import { NotificationService } from "./notification.service";
import { Notification } from "./entities/notification.entity";
import { AuthenticationGuard } from "src/auth/authentication.guard";
import { getUser } from "src/users/user.decorator";
import { User } from "src/users/users.entity";


@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notifService: NotificationService,
    ) {}

	//! add try catch block
	@Get()
	@UseGuards(AuthenticationGuard)
	async getById(
		// @Param('userId') userId: number,
		@getUser() user: User
	) {
		const notifications: Notification[] = await this.notifService.getById(user.id);
		return notifications;
	}

	@Delete(':notifId')
	@UseGuards(AuthenticationGuard)
	async deleteNotification(
		@Param('notifId', ParseIntPipe) notifId: number
	) {
		try {
			return await this.notifService.remove(notifId);
		} catch (error) {
			throw error;
		}
	}
}