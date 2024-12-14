export class RegisterMentorDto {
  mentorAddress: mentorAddressDto;
  pin: string;
  userBankAccount: userBankAccountDto;
}

class mentorAddressDto {
  street: string;
  village: string;
  neighbourhoodNumber: string;
  hamletNumber: string;
  urbanVillage: string;
  subDistrict: string;
  district: string;
  province: string;
}

class userBankAccountDto {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  paymentRecipientEmail: string;
}

export class RegisterMentorResourceDto {
  curriculumVitae?: Express.Multer.File;
  photo?: Express.Multer.File;
  identityCard?: Express.Multer.File;
}
