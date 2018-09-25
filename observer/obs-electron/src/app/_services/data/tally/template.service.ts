import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TallyTemplateData } from '../../../_models/wcgop/tally/tally-template-data';
import { TallyButton } from '../../../_models/wcgop/tally/tally-button';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  constructor(private http: HttpClient) {}

  getTemplateNames(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.http
      .get('assets/tally_templates.json')
      .toPromise()
      .then((data: any) => {
        resolve(data.templateNames);
      });
    });
  }

  loadTemplate(templateName: string): Promise<TallyButton[]> {
    console.log('Loading template:', templateName);
    return new Promise((resolve, reject) => {
      this.http
        .get(`assets/tally_templates/${templateName}.json`)
        .toPromise()
        .then((data: TallyTemplateData) => {
          console.log('Loaded', data.templateName);
          console.log(data.templateData);
          resolve(data.templateData);
        });
    });
  }

  saveTemplate(templateName: string, templateData: TallyButton[]) {
    const template = TallyTemplateData.createTallyTemplateData(templateName, templateData);
    this.stripData(template.templateData);
    console.log(template);
  }

  private stripData(data: TallyButton[]) {
    for (const d of data) {
      console.log('Strip', d);
    }
  }
}
