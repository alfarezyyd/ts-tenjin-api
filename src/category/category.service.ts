import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { CategoryValidation } from './category.validation';
import * as fs from 'node:fs';
import { ConfigService } from '@nestjs/config';
import { Category } from '@prisma/client';
import CommonHelper from '../helper/common.helper';

@Injectable()
export class CategoryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(
    logoFile: Express.Multer.File,
    createCategoryDto: CreateCategoryDto,
  ) {
    await this.validationService.validate(
      CategoryValidation.SAVE,
      createCategoryDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const generatedLogoFileName = await CommonHelper.handleSaveFile(
        this.configService,
        logoFile,
        'category-icon',
      );
      await prismaTransaction.category.create({
        data: {
          logo: generatedLogoFileName,
          ...createCategoryDto,
        },
      });
    });
    return 'Success! new category has been created';
  }

  async findAll() {
    return this.prismaService.category.findMany();
  }

  async findOne(id: number) {
    return this.prismaService.category
      .findFirstOrThrow({
        where: { id },
      })
      .catch(() => {
        throw new NotFoundException('Category not found');
      });
  }

  async update(
    categoryId: number,
    logoFile: Express.Multer.File,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const validatedUpdateCategoryDto = await this.validationService.validate(
      CategoryValidation.SAVE,
      updateCategoryDto,
    );

    try {
      await this.prismaService.$transaction(async (prismaTransaction) => {
        const categoryPrisma = await prismaTransaction.category
          .findUniqueOrThrow({
            where: { id: categoryId },
          })
          .catch(() => {
            throw new NotFoundException(
              `Category with ID ${categoryId} not found`,
            );
          });

        let generatedLogoFileName = categoryPrisma.logo;
        if (logoFile !== null) {
          const isImageDifferent = CommonHelper.compareImagesFromUpload(
            `${this.configService.get<string>('MULTER_DEST')}/category-icon/${categoryPrisma.logo}`,
            logoFile,
          );

          if (!isImageDifferent) {
            fs.unlink(
              `${this.configService.get<string>('MULTER_DEST')}/category-icon/${categoryPrisma.logo}`,
              (err) => {
                if (err) {
                  console.error('Error deleting old icon:', err);
                  throw new HttpException(
                    'Error when trying to write icon',
                    500,
                  );
                }
              },
            );
            generatedLogoFileName = await CommonHelper.handleSaveFile(
              this.configService,
              logoFile,
              'category-icon',
            );
          }
        }
        await prismaTransaction.category.update({
          where: { id: categoryPrisma.id },
          data: {
            ...validatedUpdateCategoryDto,
            logo: generatedLogoFileName,
          },
        });
      });

      return `Success! category has been updated`;
    } catch (err) {
      console.error('Transaction Error:', err);
      return `Failed! try again`;
    }
  }

  async remove(categoryId: number) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const categoryPrisma: Category = await prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id: categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with ID ${categoryId} not found`,
          );
        });
      fs.unlinkSync(
        `${this.configService.get<string>('MULTER_DEST')}/category-icon/${categoryPrisma.logo}`,
      );
      await prismaTransaction.category.delete({
        where: {
          id: categoryId,
        },
      });
    });
    return `Success! category has been deleted`;
  }

  async handleFindAllCategoryWithMentor() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const trendingAssistances = await this.prismaService.order.groupBy({
      by: ['assistantId'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        assistantId: true,
      },
      orderBy: {
        _count: {
          assistantId: 'desc',
        },
      },
      take: 5,
    });

    // Ambil detail Assistance berdasarkan id dari hasil groupBy
    const trendingAssistanceDetails =
      await this.prismaService.assistance.findMany({
        where: {
          id: {
            in: trendingAssistances.map((t) => t.assistantId), // Hanya ambil Assistance yang sesuai
          },
        },
        include: {
          mentor: {
            include: {
              user: true,
            },
          }, // Sertakan relasi jika perlu (misal mentor, category)
          category: true,
          AssistanceResource: {
            take: 1,
          },
        },
      });
    const assistancePerCategory = await this.prismaService.category.findMany({
      include: {
        Assistance: {
          take: 5,
          select: {
            id: true,
            topic: true,
            price: true,
            categoryId: true,
            durationMinutes: true,
            mentor: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    uniqueId: true,
                    name: true,
                  },
                },
              },
            },
            AssistanceResource: {
              take: 1,
            },
          },
        },
      },
    });
    return {
      trendingAssistanceDetails,
      assistancePerCategory,
    };
  }

  async findAllByCategory(id: number) {
    const categoryPrisma: Category = await this.prismaService.category
      .findFirstOrThrow({
        where: {
          id: id,
        },
        include: {},
      })
      .catch(() => {
        throw new NotFoundException('Category not found');
      });

    return {
      category: categoryPrisma,
      assistance: await this.prismaService.assistance.findMany({
        where: {
          categoryId: id,
        },
        include: {
          AssistanceResource: {
            take: 1,
          },
          mentor: {
            include: {
              user: true,
            },
          },
        },
      }),
    };
  }
}
