import { Module, MiddlewareConsumer, NestModule, RequestMethod, Inject } from "@nestjs/common";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { GraphQLModule , GraphQLFactory } from "@nestjs/graphql";
import { UpyunModule } from "../src/upyun.module";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [UpyunModule, GraphQLModule, TypeOrmModule.forRoot({
    name: "upyun",
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "postgres",
    password: "123456",
    database: "postgres",
    synchronize: true,
    dropSchema: true,
    logger: "simple-console",
    logging: false,
    entities: ["./**/*.entity.ts"]
  })],
})

export class ApplicationModule implements NestModule {

  constructor(
    @Inject(GraphQLFactory) private readonly graphQLFactory: GraphQLFactory
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths("./**/*.types.graphql");
    const schema = this.graphQLFactory.createSchema({ typeDefs });
    consumer
      .apply(graphiqlExpress({ endpointURL: "/graphql" }))
      .forRoutes("/graphiql")
      .apply(graphqlExpress(req => ({ schema, rootValue: req })))
      .forRoutes("/graphql");
  }
}
