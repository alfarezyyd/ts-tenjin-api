export class ResponseExperienceDto {
  id: bigint;
  positionName: string;
  companyName: string;
  employmentType: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
  mentorId: bigint;
  createdAt: Date;
  updatedAt: Date;
  experienceResource: ResponseExperienceResourceDto[];
}

export class ResponseExperienceResourceDto {
  id: string;
  imagePath: string | null;
  videoUrl: string | null;
}
