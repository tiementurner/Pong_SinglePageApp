import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GameHistoryService } from '../gamehistory.service';
import { WinsLossesDrawsDto } from './dto/winslosssesdraws.dto';
import { AuthenticationGuard } from 'src/auth/authentication.guard';

@Controller('winlossdraw')
export class WinlossdrawController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

  //return count of all wins, losses and draws from the gamehistory of user with :id
  @Get(':id')
  @UseGuards(AuthenticationGuard)
  getWins(@Param('id') id: string): Promise<WinsLossesDrawsDto>  {
    return this.gameHistoryService.tallyWinsLossesDraws(+id);
  }
}
