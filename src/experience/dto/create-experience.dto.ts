import { EmploymentTypeEnum } from '../enum/employment-type.enum';

export class CreateExperienceDto {
  positionName: string;
  companyName: string;
  employmentType: EmploymentTypeEnum;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}
