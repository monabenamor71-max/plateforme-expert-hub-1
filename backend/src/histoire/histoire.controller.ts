import { Controller, Get, Put, Body, ValidationPipe } from '@nestjs/common';
import { HistoireService } from './histoire.service';
import { UpdateHistoireDto } from './dto/histoire.dto';

@Controller('histoire')
export class HistoireController {
  constructor(private readonly histoireService: HistoireService) {}

  @Get()
  get() {
    return this.histoireService.get();
  }

  @Put()
  update(@Body(ValidationPipe) updateDto: UpdateHistoireDto) {
    return this.histoireService.update(updateDto);
  }
}