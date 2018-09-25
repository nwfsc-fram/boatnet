import { TallyButton } from './tally-button';

export class TallyTemplateData {
  type = 'template-data';
  templateName: string;
  templateData: TallyButton[];

  static createTallyTemplateData(name: string, data: TallyButton[]): TallyTemplateData {
    const newTemplate = new TallyTemplateData();
    newTemplate.templateName = name;
    newTemplate.templateData = data;
    return newTemplate;
  }
}

