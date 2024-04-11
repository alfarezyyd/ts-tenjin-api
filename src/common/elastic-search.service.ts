import {
  ElasticsearchModuleOptions,
  ElasticsearchOptionsFactory,
} from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class ElasticSearchService
  implements ElasticsearchOptionsFactory
{
  constructor(private readonly configService: ConfigService) {}

  createElasticsearchOptions():
    | Promise<ElasticsearchModuleOptions>
    | ElasticsearchModuleOptions {
    console.log(this.configService);
    return {
      node: this.configService.get<string>('ELASTICSEARCH_NODE'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_AUTH_USERNAME'),
        password: this.configService.get<string>('ELASTICSEARCH_AUTH_PASSWORD'),
      },
      maxRetries: 10,
      requestTimeout: 60000,
      pingTimeout: 60000,
      sniffOnStart: true,
    };
  }
}
