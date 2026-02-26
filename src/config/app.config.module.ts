import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

// config
import commonConfig from './common.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';
import { getEnvFilePath } from '../utility/common.function';
import oauthConfig from './oauth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [commonConfig, databaseConfig, oauthConfig, jwtConfig, redisConfig],
      isGlobal: true,
      envFilePath: getEnvFilePath(process.env.NODE_ENV),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
          },
          username: configService.get('redis.username'),
          password: configService.get('redis.password'),
          database: configService.get('redis.db'),
        }),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppConfigModule {}
