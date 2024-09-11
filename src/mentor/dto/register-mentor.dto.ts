export class RegisterMentorDto {
  mentorAddress: {
    street: string;
    village: string;
    neighbourhoodNumber: string;
    hamletNumber: string;
    urbanVillage: string;
    subDistrict: string;
    district: string;
    province: string;
  };
  pin: string;
  mentorBankAccount: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    paymentRecipientEmail: string;
  };
}

export class RegisterMentorResourceDto {
  curriculumVitae?: Express.Multer.File;
  photo?: Express.Multer.File;
  identityCard?: Express.Multer.File;
}
