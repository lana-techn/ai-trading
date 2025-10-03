import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TutorialAnalytics } from './entities/tutorial-analytics.entity';
import { TutorialSection } from './entities/tutorial-section.entity';
import { TutorialTag } from './entities/tutorial-tag.entity';
import { Tutorial } from './entities/tutorial.entity';
import { TutorialsController } from './tutorials.controller';
import { TutorialsService } from './tutorials.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tutorial, TutorialSection, TutorialTag, TutorialAnalytics]),
  ],
  controllers: [TutorialsController],
  providers: [TutorialsService],
  exports: [TutorialsService],
})
export class TutorialsModule {}
