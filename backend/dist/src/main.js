"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            const allowed = [
                'http://localhost:8080',
                'https://liftquest.up.railway.app',
            ];
            if (!origin || allowed.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS blocked: ${origin}`));
            }
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`Server running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map