import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Delete,
	NotFoundException,
	UseGuards,
	ParseIntPipe,
	Query } from "@nestjs/common";
import {
	IsOptional,
	IsString } from "class-validator";
import { AuthenticationGuard } from "src/auth/authentication.guard";
import { ParseStringPipe } from "src/custompipes/ParseStringPipe";
import { ChannelService } from "./channel.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { User } from "src/users/users.entity";
import { getUser } from "src/users/user.decorator"

class ChannelPassword {
	@IsOptional()
	@IsString()
	password: string;
}

@Controller('chat/channel')
export class ChannelController {
	constructor(
		private readonly channelService: ChannelService
	) {}
	
	@Get('channel_list')
	@UseGuards(AuthenticationGuard)
	async getChannels(
		@getUser() user: User
	) {
		const channels = await this.channelService.findAllChannelsFromUser(user.id);
		const filteredChannels = channels.map((channel: any) => {
			if (channel.isDM == true) {
				channel.name = channel.name.replace(user.username, '');
			}
			return channel;
		})

		return {channels: filteredChannels, username: user.username};
	}

	@Get('public_channel_list')
	@UseGuards(AuthenticationGuard)
	async getPublicChannels(
	) {
		const channels = await this.channelService.findAllPublicChannels();
		return channels;
	}

	@Get('search')
	@UseGuards(AuthenticationGuard)
	async search(
		@Query('query', ParseStringPipe) query: string
	) {
		try {
			return await this.channelService.searchByName(query);
		} catch (error) {
			throw error;
		}
	}

	@Get('exists')
	@UseGuards(AuthenticationGuard)
	async existsByName(
		@Query('name', ParseStringPipe) name: string
	) {
		try {
			return await this.channelService.existsByName(name);
		} catch (error) {
			throw error;
		}
	}

	@Post('create')
	@UseGuards(AuthenticationGuard)
	async createChannel(
		@Body() data: CreateChannelDto, 
		@getUser() user: User
	) {
		try {
			return await this.channelService.create(data, user);
		} catch (error){
			throw error;
		}
	}

	@Post('createDM/:targetuser')
	@UseGuards(AuthenticationGuard)
	async createDM(
		@Param('targetuser', ParseIntPipe) targetUser: number,
		@getUser() user: User
	) {
		try {
			return await this.channelService.createDM(user, targetUser);
		} catch (error) {
			throw error;
		}
	}

	@Delete(':channelId/delete') //! as of june 3d only route in this controller that hasn't been tested again
	@UseGuards(AuthenticationGuard)
	async deleteChannel (
		@Param('channelId', ParseIntPipe) channelId: number,
		@getUser() user: User
	) {
		try {
			return await this.channelService.remove(channelId, user);
		} catch (error) {
			throw error;
		}
	}

	@Delete(':channelId/leave')
	@UseGuards(AuthenticationGuard)
	async leaveChannel (
		@Param('channelId', ParseIntPipe) channelId: number,
		@getUser() user: User
	) {
		try {
			await this.channelService.leave(channelId, user);
			return `user ${user.username} left channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}

	@Post(':channelId/join')
	@UseGuards(AuthenticationGuard)
	async joinChannel(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Body() data: ChannelPassword,
		@getUser() user: User
	) {
		try {
			return await this.channelService.join(channelId, user, data.password);
		} catch (error) {
			throw error;
		}
	}

	@Get(':channelId/info')
	@UseGuards(AuthenticationGuard)
	async channelInfo(
		@Param('channelId', ParseIntPipe) channelId: number,
		@getUser() user: User
	) {
		try {
			return await this.channelService.getChannelInfo(channelId, user);
		} catch (error) {
			throw error;
		}
	}

	@Get(':channelId/members')
	@UseGuards(AuthenticationGuard)
	async channelMembers(
		@Param('channelId', ParseIntPipe) channelId: number
	) {
		try {
			return await this.channelService.getChannelMembers(channelId);
		} catch (error) {
			throw error;
		}
	}

	@Delete(':channelId/kick/:targetuser')
	@UseGuards(AuthenticationGuard)
	async kickUser(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Param('targetuser', ParseIntPipe) targetUser: number,
		@getUser() user: User
	) {
		try {
			await this.channelService.kick(channelId, user.id, targetUser);
			return `kicked user ${targetUser} from channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}

	@Post(':channelId/ban/:targetuser')
	@UseGuards(AuthenticationGuard)
	async BanUser(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Param('targetuser', ParseIntPipe) targetUser: number,
		@getUser() user: User
	) {
		try {
			await this.channelService.ban(channelId, user.id, targetUser);
			return `banned user ${targetUser} from channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}

	@Post(':channelId/mute/:targetuser')
	@UseGuards(AuthenticationGuard)
	async muteUser(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Param('targetuser', ParseIntPipe) targetUser: number,
		@getUser() user: User
	) {
		try {
			await this.channelService.mute(channelId, user.id, targetUser);
			return `muted user ${targetUser} in channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}

	@Post(':channelId/admin/:targetuser')
	@UseGuards(AuthenticationGuard)
	async setAdmin(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Param('targetuser', ParseIntPipe) targetUser: number,
		@getUser() user: User
	) {
		try {
			await this.channelService.setAdmin(channelId, user.id, targetUser);
			return `toggled admin for user ${targetUser} in channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}
	
	@Post(':channelId/changePassword')
	@UseGuards(AuthenticationGuard)
	async changePassword(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Body() data: ChannelPassword,
		@getUser() user: User
	) {
		try {
			await this.channelService.changePassword(channelId, user.id, data);
			return `password changed for channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}

	@Post(':channelId/addPassword')
	@UseGuards(AuthenticationGuard)
	async addPassword(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Body() data: ChannelPassword,
		@getUser() user: User
	) {
		try {
			await this.channelService.addPassword(channelId, user.id, data);
			return `password added for channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}

	@Delete(':channelId/removePassword')
	@UseGuards(AuthenticationGuard)
	async removePassword(
		@Param('channelId', ParseIntPipe) channelId: number,
		@getUser() user: User
	) {
		try {
			await this.channelService.removePassword(channelId, user.id);
			return `removed password for channel ${channelId}`;
		} catch (error) {
			throw error;
		}
	}

	@Get(':id/getname')
	@UseGuards(AuthenticationGuard)
	async getChannelName(
		@Param('id', ParseIntPipe) id: number,
		@getUser() user: User
	) {
		const channel = await this.channelService.findById(id);
	
		if (!channel)
			throw new NotFoundException("Channel not found.");

		let channelname = channel.name;

		if (channel.isDM == true) {
			channelname = channel.name.replace(user.username, '');
		}
		return channelname;
	}
}
