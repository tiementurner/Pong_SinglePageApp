import { Controller, ParseIntPipe, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingDto } from './ranking.dto';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { ParseStringPipe } from 'src/custompipes/ParseStringPipe';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  @UseGuards(AuthenticationGuard)
  findAll() {
    return this.rankingService.getLeaderboard();
  }
//
//   @Get(':id')
//   @UseGuards(AuthenticationGuard)
//   findOne(@Param('id', ParseIntPipe) id: number): Promise<RankingDto> {
//     return this.rankingService.getRankingById(+id);
//   }

  @Patch(':id')
  @UseGuards(AuthenticationGuard)
  update(@Param('id', ParseStringPipe) id: string) {
    return this.rankingService.increaseScore(+id, 1);
  }
}
