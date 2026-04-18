import { Controller, Get, Injectable, Module } from '@nestjs/common';

@Injectable()
export class EtlService {
  readonly moduleName = 'etl';
  ping(): string {
    return 'etl-service ready';
  }
}

@Controller('internal/etl')
export class EtlController {
  constructor(private readonly svc: EtlService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

@Module({
  controllers: [EtlController],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {}
