import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import {
  Mentor,
  OrderCondition,
  OrderPaymentStatus,
  OrderStatus,
  ResourceType,
  User,
} from '@prisma/client';
import {
  RegisterMentorDto,
  RegisterMentorResourceDto,
} from './dto/register-mentor.dto';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { MentorValidation } from './mentor.validation';
import CommonHelper from '../helper/common.helper';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UpdateBankAccountMentorDto } from './dto/update-bank-account-mentor.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MentorService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    uploadedFiles: RegisterMentorResourceDto,
    currentUser: LoggedUser,
    registerMentorDto: RegisterMentorDto,
  ) {
    const validatedRegisterMentorDto = this.validationService.validate(
      MentorValidation.CREATE,
      registerMentorDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: currentUser.uniqueId,
          },
        })
        .catch(() => {
          throw new HttpException(
            `User with uniqueId ${currentUser.uniqueId} not found`,
            404,
          );
        });
      const mentorPrisma: Mentor = await prismaTransaction.mentor.create({
        data: {
          userId: userPrisma.id,
        },
      });
      await prismaTransaction.mentorAddress.create({
        data: {
          ...validatedRegisterMentorDto.mentorAddress,
          mentorId: mentorPrisma.id,
        },
      });
      await prismaTransaction.userBankAccount.create({
        data: {
          ...validatedRegisterMentorDto.userBankAccount,
          userId: userPrisma.id,
        },
      });
      const mentorResourcesPayload = [];
      mentorResourcesPayload.push({
        imagePath: await CommonHelper.handleSaveFile(
          this.configService,
          uploadedFiles.curriculumVitae[0],
          `mentor-resources/documents/${mentorPrisma.id}`,
        ),
        mentorId: mentorPrisma.id,
        resourceType: ResourceType.DOCUMENT,
      });
      mentorResourcesPayload.push({
        imagePath: await CommonHelper.handleSaveFile(
          this.configService,
          uploadedFiles.identityCard[0],
          `mentor-resources/documents/${mentorPrisma.id}`,
        ),
        mentorId: mentorPrisma.id,
        resourceType: ResourceType.DOCUMENT,
      });

      mentorResourcesPayload.push({
        imagePath: await CommonHelper.handleSaveFile(
          this.configService,
          uploadedFiles.photo[0],
          `mentor-resources/profile/${mentorPrisma.id}`,
        ),
        mentorId: mentorPrisma.id,
      });

      await prismaTransaction.mentorResource.createMany({
        data: mentorResourcesPayload,
      });
      const payloadJwt = {
        uniqueId: currentUser.uniqueId,
        name: userPrisma.name,
        email: currentUser.email,
        gender: userPrisma.gender,
        telephone: userPrisma.telephone,
        mentorId: mentorPrisma.id,
        isExternal: currentUser.isExternal,
        isManagement: currentUser.isManagement,
        photoPath: currentUser.photoPath,
      };
      return {
        accessToken: await this.jwtService.signAsync(payloadJwt),
      };
    });
  }

  async findOne(uniqueId: string) {
    return this.prismaService.mentor
      .findFirstOrThrow({
        where: {
          user: {
            uniqueId: uniqueId,
          },
        },
        include: {
          user: true,
          Assistance: {
            include: {
              category: true,
              Review: {
                take: 5,
                orderBy: {
                  id: 'desc',
                },
                include: {
                  User: {
                    select: {
                      name: true,
                      photoPath: true,
                    },
                  },
                },
              },
              AssistanceLanguage: {
                include: {
                  language: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              AssistanceTag: {
                include: {
                  tag: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              AssistanceResource: true,
              _count: {
                select: {
                  Order: true,
                },
              },
            },
          },
          MentorResource: {
            where: {
              resourceType: ResourceType.IMAGE,
            },
          },
          MentorAddress: true,
          Experience: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          Education: {
            take: 1,
            orderBy: {
              endDate: 'desc',
            },
          },
          _count: {
            select: {
              Order: true,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Mentor not found');
      });
  }

  async findAllMentorSchedule(mentorPrisma: Mentor) {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const allOrderPrisma = await prismaTransaction.order.findMany({
        where: {
          AND: [
            {
              mentorId: mentorPrisma.id,
            },
            {
              userId: {
                not: mentorPrisma.userId,
              },
            },
          ],
        },
        include: {
          assistance: true,
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      const allMentorSchedule = [];
      const countMentorOrder = {
        failed: 0,
        process: 0,
        completed: 0,
      };
      for (const orderPrisma of allOrderPrisma) {
        switch (orderPrisma.orderStatus) {
          case OrderStatus.FINISHED:
            countMentorOrder.completed++;
            break;
          case OrderStatus.PROCESSED:
          case OrderStatus.CONFIRMED:
            countMentorOrder.process++;
            break;
          case OrderStatus.CANCELLED:
            countMentorOrder.failed++;
            break;
          default:
            break;
        }
        allMentorSchedule.push({
          title: orderPrisma.assistance.topic,
          userName: orderPrisma.user.name,
          meetingPlatform: orderPrisma.meetingPlatform,
          meetingPasskey: orderPrisma.meetingPasskey,
          meetingLink: orderPrisma.meetingLink,
          start: new Date(
            orderPrisma.sessionStartTimestamp.getTime() + 7 * 60 * 60 * 1000,
          ),
          end: new Date(
            orderPrisma.sessionEndTimestamp.getTime() + 7 * 60 * 60 * 1000,
          ),
        });
      }
      return {
        countMentorOrder,
        allMentorSchedule,
        lastFiveMentorOrders: allOrderPrisma.slice(0, 5),
      };
    });
  }

  async handleFindAllOrder(loggedUser: LoggedUser) {
    const allOrder = await this.prismaService.order.findMany({
      where: {
        mentorId: BigInt(loggedUser.mentorId),
        orderCondition: {
          not: {
            in: [OrderCondition.REJECT, OrderCondition.DONE],
          },
        },
        orderPaymentStatus: {
          not: OrderPaymentStatus.NOT_YET_PAID,
        },
        orderStatus: {
          not: {
            in: [OrderStatus.FINISHED, OrderStatus.REVIEWED],
          },
        },
      },
      select: {
        sessionStartTimestamp: true,
        sessionEndTimestamp: true,
        orderCondition: true,
        id: true,
        user: {
          select: {
            name: true,
          },
        },
        meetingPlatform: true,
        meetingPasskey: true,
        meetingLink: true,
        assistance: {
          select: {
            topic: true,
          },
        },
      },
    });
    Object.entries(allOrder).forEach(([, value]) => {
      value.sessionStartTimestamp = new Date(
        value.sessionStartTimestamp.getTime() + 7 * 60 * 60 * 1000,
      );
      value.sessionEndTimestamp = new Date(
        value.sessionEndTimestamp.getTime() + 7 * 60 * 60 * 1000,
      );
    });
    return allOrder;
  }

  async handleBookingCondition(
    currentUser: LoggedUser,
    updateBookingCondition: {
      orderId: string;
      bookingCondition: string;
    },
  ) {
    const validatedUpdateBookingCondition = this.validationService.validate(
      MentorValidation.UPDATE_BOOKING_CONDITION,
      updateBookingCondition,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.order
        .findFirstOrThrow({
          where: {
            mentorId: BigInt(currentUser.mentorId),
            id: updateBookingCondition.orderId,
          },
        })
        .catch(() => {
          throw new NotFoundException('Order not found');
        });
      await prismaTransaction.order.update({
        where: {
          mentorId: BigInt(currentUser.mentorId),
          id: updateBookingCondition.orderId,
        },
        data: {
          orderCondition:
            OrderCondition[validatedUpdateBookingCondition.bookingCondition],
        },
      });
    });
  }

  async handleUpdateBookingMeetingLink(
    updateBookingMeetingLinkDto: {
      meetingPlatform: string;
      meetingPasskey: string;
      meetingLink: string;
    },
    orderId: string,
    currentUser: LoggedUser,
  ) {
    const validatedUpdateBookingMeeting = this.validationService.validate(
      MentorValidation.UPDATE_BOOKING_MEETING_LINK,
      updateBookingMeetingLinkDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const orderPrisma = await prismaTransaction.order
        .findFirstOrThrow({
          where: {
            id: orderId,
            mentorId: BigInt(currentUser.mentorId),
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
            assistance: {
              select: {
                topic: true,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException('Order not found');
        });
      await prismaTransaction.order.update({
        where: {
          id: orderId,
          mentorId: BigInt(currentUser.mentorId),
        },
        data: {
          meetingPlatform: validatedUpdateBookingMeeting.meetingPlatform,
          meetingPasskey: validatedUpdateBookingMeeting.meetingPasskey,
          meetingLink: validatedUpdateBookingMeeting.meetingLink,
        },
      });
      await this.mailerService.sendMail({
        from: this.configService.get<string>('EMAIL_USERNAME'),
        to: orderPrisma.user.email,
        subject: `Meeting ${orderPrisma.assistance.topic}`,
        html: `
    <h1>Informasi Meeting</h1>
    <p>Infomrasi meeting Anda telah diperbarui oleh Mentor. Perhatikan dengan baik dan seksaman</p>
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="padding: 8px; background-color: #f4f4f4;">Meeting Platform</th>
          <th style="padding: 8px; background-color: #f4f4f4;">Meeting Passkey</th>
          <th style="padding: 8px; background-color: #f4f4f4;">Meeting Link</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; text-align: center;">${validatedUpdateBookingMeeting.meetingPlatform}</td>
          <td style="padding: 8px; text-align: center;">${validatedUpdateBookingMeeting.meetingPasskey}</td>
          <td style="padding: 8px; text-align: center;">${validatedUpdateBookingMeeting.meetingLink}</td>
        </tr>
      </tbody>
    </table>
  `,
      });
    });
  }

  async handleFindOneSetting(currentUser: LoggedUser) {
    return this.prismaService.mentor
      .findFirstOrThrow({
        where: {
          id: BigInt(currentUser.mentorId),
        },
        include: {
          MentorResource: {
            where: {
              resourceType: ResourceType.IMAGE,
            },
            skip: 1,
          },
          MentorAddress: true,
        },
      })
      .catch(() => {
        throw new NotFoundException('Mentor not found');
      });
  }

  async handleFindMentorAccount(loggedUser: LoggedUser) {
    return this.prismaService.userBankAccount
      .findFirstOrThrow({
        where: {
          User: {
            uniqueId: loggedUser.uniqueId,
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
  }

  async handleUpdateMentorAccount(
    currentUser: LoggedUser,
    updateBankAccountMentorDto: UpdateBankAccountMentorDto,
  ) {
    const validatedUpdateBankAccount = this.validationService.validate(
      MentorValidation.UPDATE_MENTOR_BANK_ACCOUNT,
      updateBankAccountMentorDto,
    );
    console.log(validatedUpdateBankAccount);
    return this.prismaService.$transaction(async (prismaTransaction) => {
      if (!validatedUpdateBankAccount.id) {
        await prismaTransaction.userBankAccount.create({
          data: {
            accountHolderName:
              validatedUpdateBankAccount.accountHolderName as string,
            bankName: validatedUpdateBankAccount.bankName as string,
            accountNumber: validatedUpdateBankAccount.accountNumber as string,
            paymentRecipientEmail:
              validatedUpdateBankAccount.paymentRecipientEmail as string,
            User: {
              connect: {
                uniqueId: currentUser.uniqueId,
              },
            },
          },
        });
        return true;
      }
      await prismaTransaction.userBankAccount
        .findFirstOrThrow({
          where: {
            User: {
              uniqueId: currentUser.uniqueId,
            },
            id: validatedUpdateBankAccount.id,
          },
        })
        .catch(() => {
          throw new NotFoundException('Mentor bank account not found');
        });
      await prismaTransaction.userBankAccount.update({
        where: {
          User: {
            uniqueId: currentUser.uniqueId,
          },
          id: validatedUpdateBankAccount.id,
        },
        data: validatedUpdateBankAccount,
      });
      return true;
    });
  }

  async handleFindMentorEducation(userUniqueId: string) {
    const mentorPrisma = await this.prismaService.mentor
      .findFirstOrThrow({
        where: {
          user: {
            uniqueId: userUniqueId,
          },
        },
        select: {
          id: true,
        },
      })
      .catch(() => {
        throw new NotFoundException('Mentor not found');
      });
    return this.prismaService.education.findMany({
      where: {
        mentorId: mentorPrisma.id,
      },
    });
  }

  async handleFindMentorExperience(userUniqueId: string) {
    const mentorPrisma = await this.prismaService.mentor
      .findFirstOrThrow({
        where: {
          user: {
            uniqueId: userUniqueId,
          },
        },
        select: {
          id: true,
        },
      })
      .catch(() => {
        throw new NotFoundException('Mentor not found');
      });
    return this.prismaService.experience.findMany({
      where: {
        mentorId: mentorPrisma.id,
      },
      include: {
        ExperienceResource: true,
      },
    });
  }

  async handleRejectBooking(rejectBookingDto: {
    orderId: string;
    reason: string;
  }) {
    const validatedRejectBooking = this.validationService.validate(
      MentorValidation.REJECT_BOOKING,
      rejectBookingDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const orderPrisma = await prismaTransaction.order
        .findFirstOrThrow({
          where: {
            id: validatedRejectBooking.orderId,
          },
          include: {
            assistance: true,
            user: {
              select: {
                email: true,
                name: true,
                totalBalance: true,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException('Order not found');
        });
      console.log(orderPrisma);
      await prismaTransaction.user.update({
        where: {
          id: orderPrisma.userId,
        },
        data: {
          totalBalance:
            orderPrisma.user.totalBalance +
            BigInt(
              Math.round(orderPrisma.assistance.price * orderPrisma.quantity),
            ),
        },
      });
      await prismaTransaction.order.update({
        where: {
          id: validatedRejectBooking.orderId,
        },
        data: {
          orderStatus: OrderStatus.CANCELLED,
          orderCondition: OrderCondition.REJECT,
        },
      });
      await this.mailerService.sendMail({
        from: this.configService.get<string>('EMAIL_USERNAME'),
        to: orderPrisma.user.email,
        subject: `Informasi Meeting ${orderPrisma.assistance.topic}`,
        html: `
    <h1>Penolakan Asistensi Diajukan Oleh Mentor</h1>
    <p>Mohon maaf, ${orderPrisma.user.name} pemesanan asistensi Anda ditolak oleh mentor, total saldo telah dikembalikan pada akun Anda</p>
  `,
      });
      return true;
    });
  }
}
