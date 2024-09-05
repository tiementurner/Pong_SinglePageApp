import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GameHistoryService } from './gamehistory.service';
import { GameHistoryDto } from './dto/gamehistory.dto';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { Stats } from 'fs';

export interface StatsHistoryData {
	matches: any,
	total: number,
	wins: number,
	losses: number,
	rank: string
}

@Controller('gamehistory')
export class GameHistoryController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

//we have to add @UseGuard(AuthenticationGuard) and @getUser()
  //to these routes when all testing with postman is done.

  //returns an array of gamehistory the user with the given id participated in
  //see the GameHistoryDto if you want to see what each entry in the array looks like
  @Get(':id')
	@UseGuards(AuthenticationGuard)
	async findAllByUserId(@Param('id', ParseIntPipe) id: number): Promise<StatsHistoryData>  {
		return await this.gameHistoryService.getPublic(id);
		// let data: StatsHistoryData = {
		// 	matches: await this.gameHistoryService.findAll(id),
		// 	total: 0,
		// 	wins: 0,
		// 	losses: 0,
		// 	draws: 0,
		// 	rank: 0
		// }
		// return data;
  }
}
