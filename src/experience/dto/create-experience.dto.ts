import { EmploymentType } from '@prisma/client';

export class CreateExperienceDto {
  positionName: string;
  companyName: string;
  employmentType: EmploymentType;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}
