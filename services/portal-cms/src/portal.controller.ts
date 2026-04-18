/**
 * portal-cms HTTP 控制器：
 *   公开路由：/api/v1/public/portal/pages/:slug、/api/v1/public/portal/news(/:id)
 *   管理路由：/api/v1/admin/portal/{pages,templates,news}，统一带 @RequirePerm
 *
 * Controller 层不 throw 业务错误，由底层 Service 抛 CmsError，ProblemDetailsFilter 统一转换。
 * 入口使用 Zod 显式校验请求体/查询参数。
 */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { CmsError } from './errors.js';
import { NewsService } from './news.service.js';
import { PageService } from './page.service.js';
import {
  ApplyTemplateSchema,
  CreateNewsSchema,
  CreatePageSchema,
  NewsListQuerySchema,
  PublishPageSchema,
  UpdateNewsSchema,
  UpdatePageSchema,
} from './schemas.js';
import { CmsRolesGuard, RequirePerm } from './roles.guard.js';
import { TemplateService } from './template.service.js';
import type { NewsListResult, NewsRow, PageRow, TemplateRow } from './types.js';

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const res = schema.safeParse(data);
  if (!res.success) {
    const detail = res.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    throw new BadRequestException(`请求参数校验失败：${detail}`);
  }
  return res.data as z.output<T>;
}

@Controller('api/v1/public/portal')
export class PublicPortalController {
  constructor(
    private readonly pages: PageService,
    private readonly news: NewsService,
  ) {}

  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string): Promise<PageRow> {
    return this.pages.getBySlug(slug);
  }

  @Get('news')
  async listNews(@Query() query: unknown): Promise<NewsListResult> {
    const parsed = parseOrThrow(NewsListQuerySchema, query ?? {});
    return this.news.listPublished(parsed);
  }

  @Get('news/:id')
  async getNews(@Param('id') id: string): Promise<NewsRow> {
    const item = await this.news.getById(id);
    if (!item.published) {
      // 未发布的条目对公开端不可见
      throw new CmsError('NEWS_NOT_FOUND', `news ${id} 未发布`, 404);
    }
    return item;
  }
}

@UseGuards(CmsRolesGuard)
@Controller('api/v1/admin/portal')
export class AdminPortalController {
  constructor(
    private readonly pages: PageService,
    private readonly templates: TemplateService,
    private readonly news: NewsService,
  ) {}

  // ---------- pages ----------
  @Post('pages')
  @RequirePerm('admin', 'cms_editor')
  async createPage(@Body() body: unknown): Promise<PageRow> {
    const input = parseOrThrow(CreatePageSchema, body);
    return this.pages.createPage(input);
  }

  @Get('pages')
  @RequirePerm('admin', 'cms_editor')
  async listPages(): Promise<PageRow[]> {
    return this.pages.listPages();
  }

  @Get('pages/:slug')
  @RequirePerm('admin', 'cms_editor')
  async getPageBySlug(
    @Param('slug') slug: string,
    @Query('version') version?: string,
  ): Promise<PageRow> {
    if (version) {
      const v = Number(version);
      if (!Number.isInteger(v) || v <= 0) {
        throw new BadRequestException('version 必须为正整数');
      }
      const row = await this.pages.findBySlugAndVersion(slug, v);
      if (!row) {
        throw new CmsError('PAGE_NOT_FOUND', `page ${slug}@${v} 不存在`, 404);
      }
      return row;
    }
    return this.pages.getBySlug(slug);
  }

  @Put('pages/:slug')
  @RequirePerm('admin', 'cms_editor')
  async updatePage(@Param('slug') slug: string, @Body() body: unknown): Promise<PageRow> {
    const input = parseOrThrow(UpdatePageSchema, body);
    return this.pages.updatePage(slug, input);
  }

  @Post('pages/:slug/publish')
  @RequirePerm('admin', 'cms_editor')
  async publishPage(@Param('slug') slug: string, @Body() body: unknown): Promise<PageRow> {
    const { version } = parseOrThrow(PublishPageSchema, body);
    return this.pages.publishPage(slug, version);
  }

  // ---------- templates ----------
  @Get('templates')
  @RequirePerm('admin', 'cms_editor')
  async listTemplates(): Promise<TemplateRow[]> {
    return this.templates.listTemplates();
  }

  @Post('templates/apply')
  @RequirePerm('admin', 'cms_editor')
  async applyTemplate(@Body() body: unknown): Promise<PageRow> {
    const input = parseOrThrow(ApplyTemplateSchema, body);
    return this.templates.applyTemplate(
      input.slug,
      input.templateId,
      input.title,
    );
  }

  // ---------- news ----------
  @Post('news')
  @RequirePerm('admin', 'cms_editor', 'news_editor')
  async createNews(@Body() body: unknown): Promise<NewsRow> {
    const input = parseOrThrow(CreateNewsSchema, body);
    return this.news.create(input);
  }

  @Get('news')
  @RequirePerm('admin', 'cms_editor', 'news_editor')
  async listNewsAll(@Query() query: unknown): Promise<NewsListResult> {
    const parsed = parseOrThrow(NewsListQuerySchema, query ?? {});
    return this.news.listAll(parsed);
  }

  @Get('news/:id')
  @RequirePerm('admin', 'cms_editor', 'news_editor')
  async getNewsById(@Param('id') id: string): Promise<NewsRow> {
    return this.news.getById(id);
  }

  @Put('news/:id')
  @RequirePerm('admin', 'cms_editor', 'news_editor')
  async updateNews(@Param('id') id: string, @Body() body: unknown): Promise<NewsRow> {
    const input = parseOrThrow(UpdateNewsSchema, body);
    return this.news.update(id, input);
  }

  @Post('news/:id/publish')
  @RequirePerm('admin', 'cms_editor', 'news_editor')
  async publishNews(@Param('id') id: string): Promise<NewsRow> {
    return this.news.publish(id);
  }

  @Delete('news/:id')
  @RequirePerm('admin', 'cms_editor')
  async removeNews(@Param('id') id: string): Promise<{ ok: true }> {
    await this.news.remove(id);
    return { ok: true };
  }
}
