import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
	// const app = await NestFactory.create(AppModule);
	const app = await NestFactory.create(AppModule, {snapshot: true});
	
	
	const server = app.getHttpServer();
	server.keepAliveTimeout = 30000;

	const configService = app.get(ConfigService);
	//maybe use MemoryStore
	const sessionMiddleware = session({
		name: 'sessionID',
		secret: configService.getOrThrow('SESSION_SECRET'),
		resave: false,
		saveUninitialized: false,
		cookie: {
			sameSite: false,
			httpOnly: true,
		}
	})

	app.use(sessionMiddleware);

	app.useGlobalPipes(new ValidationPipe());

	const corsOptions: CorsOptions = {
		origin: configService.getOrThrow('FRONTEND_URL'),
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	};
	app.enableCors(corsOptions);

	await app.listen(3001);
}
bootstrap();
