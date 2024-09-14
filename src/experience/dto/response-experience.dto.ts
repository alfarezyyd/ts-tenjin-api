export class ResponseExperienceDto {
  id: string;
  positionName: string;
  companyName: string;
  employmentType: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
  mentorId: string;
  experienceResource: ResponseExperienceResourceDto[];
}

export class ResponseExperienceResourceDto {
  id: string;
  imagePath: string | null;
  videoUrl: string | null;
}
