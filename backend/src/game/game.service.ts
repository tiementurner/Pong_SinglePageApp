// import { Injectable} from '@nestjs/common';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';

// @Injectable()
// export class SocketAuthService {
//   constructor(
//       private readonly userService: UsersService
//   ) {}

//   private temporaryCodes: Map<string, any> = new Map();

//   storeTemporaryCode(code: string, userId: number) {
//     this.temporaryCodes.set(code, userId);
//   }

//   getUserDataByCode(code: string): number {
//     return this.temporaryCodes.get(code);
//   }

//   deleteTemporaryCode(code: string) {
//     this.temporaryCodes.delete(code);
//   }

// }