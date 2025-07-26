"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: true,
    });
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const port = process.env.PORT ?? 3000;
    const server = (await app.listen(port));
    server.setTimeout(300000);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log('Server timeout set to 5 minutes for long-running API calls');
}
bootstrap().catch((err) => {
    console.error('Failed to bootstrap the application', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map