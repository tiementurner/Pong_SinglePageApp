import {
	IsBoolean,
	IsString } from "class-validator";

export class CreateChannelDto {

	@IsString()
	name: string;

	@IsBoolean()
	isPrivate: boolean;

	@IsString()
	password: string;

	@IsBoolean()
	isDM: boolean;
}