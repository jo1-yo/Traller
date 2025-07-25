import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Server } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 增加请求超时时间
    bodyParser: true,
  });

  // 启用CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;

  // 设置服务器超时时间为5分钟
  const server = (await app.listen(port)) as Server;
  server.setTimeout(300000); // 5分钟超时

  console.log(`Application is running on: http://localhost:${port}`);
  console.log('Server timeout set to 5 minutes for long-running API calls');
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap the application', err);
  process.exit(1);
});
