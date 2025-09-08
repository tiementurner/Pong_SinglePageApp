import { Controller } from '@nestjs/common';
import { Status } from './Status';

@Controller('status')
export class StatusController {
    constructor(private readonly allStatus: Status){};
    
}
