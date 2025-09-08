import { unlink, writeFile } from 'node:fs/promises';
import {
	Controller,
	Post,
	Param,
	ParseIntPipe,
	UseInterceptors,
	UploadedFile,
	ParseFilePipe,
	FileTypeValidator,
	MaxFileSizeValidator,
	UseGuards, 
	HttpStatus,
	Get,
	StreamableFile,
	Delete,
  BadRequestException,
  Res} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AvatarService } from './avatar.service';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { User } from '../users.entity';
import { getUser } from '../user.decorator';
import { ParseStringPipe } from 'src/custompipes/ParseStringPipe';
import * as sharp from 'sharp';
import { createReadStream, promises as fsPromises } from 'fs';
import { FileLockService } from './file-lock.service';
import { Response } from 'express';

@Controller('avatar')
export class AvatarController {
  	constructor(
		private readonly avatarService: AvatarService,
    private readonly fileLockService: FileLockService
	) {}
//! add try catch blocks to these routes?

  @Post(':id')
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          //only accept image types, max filesize is 4 megabyte in bytes
          new FileTypeValidator({fileType: '.(png|jpg|jpeg)'}),
          new MaxFileSizeValidator({maxSize: 4194304, message: 'avatar must be under 4 MB',})
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    ) file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
	@getUser() user: User) {
    console.log(file.originalname);
      try {
        try {
          await sharp(file.buffer).metadata();
        } catch (error) {
          throw new BadRequestException('Invalid image file');
        }
        //delete the old avatar if it isn't default.png
        const fs = require('node:fs');
        const response = await this.avatarService.getFileNameById(id);
        if (response.image != "default.png") {
          if (fs.existsSync("public/img/" + response.image)) {
            unlink("public/img/" + response.image), (err: any) => {
              if (err) console.log(err);
            }
          }
        }
        //save the file (with the userid as filename)
        const path = require('path');
        const newFileName: string = id + path.extname(file.originalname);
        await writeFile(`public/img/${newFileName}`, file.buffer);
        //save this new filename in the db
        await this.avatarService.add(id, newFileName);
      } catch (error){
        throw error;
      }
  }

	@Get(':image')
	@UseGuards(AuthenticationGuard)
	async getFile(
		@Param('image', ParseStringPipe) image: string,
    @Res() res: Response
	) {
		//check if file exists, if it doesn't, change the image to default as a failsafe
    const filePath = "public/img/" + image;
    try {
      await fsPromises.access(filePath);
    } catch {
      image = 'default.png';
    }

    const unlock = await this.fileLockService.lock(filePath);
    try {	
      const file = createReadStream(filePath);
      file.on('open', () => {
        res.setHeader('Content-Type', 'image/jpeg');
        file.pipe(res);
      });
      file.on('error', (err) => {
        console.log(err);
      });
    } finally {
      unlock();
    }
	}

  @Delete(':id')
  @UseGuards(AuthenticationGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number
  ) {
    //delete current avatar image from backend if it is not default.png
    const response = await this.avatarService.getFileNameById(id);
    if (response.image != "default.png") {
      await unlink("public/img/" + response.image), (err) => {
        if (err) console.log(err);
      }
    }
    //this sets the avatar image back to default.png
    return this.avatarService.remove(+id);
  }
}
