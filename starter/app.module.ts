import { Module,MiddlewaresConsumer,NestModule,RequestMethod, } from '@nestjs/common';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { GraphQLModule , GraphQLFactory} from '@nestjs/graphql';
import { UpyunModule } from '../src/UpyunModule';
@Module({
  modules: [UpyunModule,GraphQLModule],
  controllers: [],
  components: []
})


export class ApplicationModule implements NestModule{

  constructor(private readonly graphQLFactory: GraphQLFactory){}

  configure(consumer: MiddlewaresConsumer) {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./src/graphql/type/**/*.types.graphql');
    const schema = this.graphQLFactory.createSchema({ typeDefs });
    consumer
      .apply(graphiqlExpress({ endpointURL: '/graphql' }))
      .forRoutes({ path: '/graphiql', method: RequestMethod.GET })
      .apply(graphqlExpress(req => ({ schema, rootValue: req })))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
