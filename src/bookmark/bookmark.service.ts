import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) { }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        console.log(userId, dto)
        return await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto,
            }
        });
    }

    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId,
            }
        });
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                userId,
                id: bookmarkId,
            },
        });
    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        console.log('editBookmarkById', dto)
        const bookmark = await this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
            }
        })

        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException('Access to resources denied');

        console.log(bookmark);
        return await this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
            },
            data: {
                ...dto,
            }
        });
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        console.log('delete')

        try {
            const bookmark = await this.prisma.bookmark.findFirst({
                where: {
                    id: bookmarkId,
                }
            });

            if (!bookmark || bookmark.userId !== userId) {
                throw new ForbiddenException('Access to resources denied');
            }

            await this.prisma.bookmark.delete({
                where: {
                    id: bookmarkId,
                }
            })
        } catch (e) {
            throw new ForbiddenException('Error');
        }
    }
}
