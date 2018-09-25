// Settings
import { Settings, Categories, Programs, Positions } from '../../settings';

// App Configurations
import { AcousticAppConfig } from '../acoustic/acoustic-app-config';
// TODO - trawl
// TODO - hookandline
import { WcgopAppConfig } from '../wcgop/wcgop-app-config';
import { AshopAppConfig } from '../ashop/ashop-app-config';

export class AppConfig {
  category = Settings.category;
  program = Settings.program;
  position = Settings.position;

  config: any;

  constructor() {
    this.configureApp(this.category, this.program);
  }

  configureApp(category: Categories, program: Programs) {
    switch (category) {
      case Categories.Survey:       // Surveys
        switch (program) {
          case Programs.Hake:
            this.config = AcousticAppConfig; // AcousticAppConfig.createAcousticAppState();
            break;
          case Programs.Trawl:
            break;
          case Programs.HookAndLine:
            break;
        }
        break;
      case Categories.Observer:     // Observer
        switch (program) {
          case Programs.WCGOP:
            this.config = WcgopAppConfig; // WcgopAppConfig.createWcgopAppState();
            break;
          case Programs.ASHOP:
            this.config = AshopAppConfig; // AshopAppConfig.createAshopAppState();
            break;
        }
        break;
    }
  }
}
