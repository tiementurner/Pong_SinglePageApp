import {
	IsEmail,
	IsNumber,
	IsString } from 'class-validator';
	
export class CreateUserDto{

	@IsNumber()
	id: number;
	
	@IsString()
	username: string;

	@IsEmail({}, { message: 'Invalid email format' })
	email: string;

	@IsString()
	twofaenabled: string;

	@IsString()
	image: string;

}
