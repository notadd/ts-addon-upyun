"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const apollo_server_express_1 = require("apollo-server-express");
const graphql_1 = require("@nestjs/graphql");
const upyun_module_1 = require("../src/upyun.module");
const typeorm_1 = require("@nestjs/typeorm");
let ApplicationModule = class ApplicationModule {
    constructor(graphQLFactory) {
        this.graphQLFactory = graphQLFactory;
    }
    configure(consumer) {
        const typeDefs = this.graphQLFactory.mergeTypesByPaths('./src/graphql/type/**/*.types.graphql');
        const schema = this.graphQLFactory.createSchema({ typeDefs });
        consumer
            .apply(apollo_server_express_1.graphiqlExpress({ endpointURL: '/graphql' }))
            .forRoutes({ path: '/graphiql', method: common_1.RequestMethod.GET })
            .apply(apollo_server_express_1.graphqlExpress(req => ({ schema, rootValue: req })))
            .forRoutes({ path: '/graphql', method: common_1.RequestMethod.ALL });
    }
};
ApplicationModule = __decorate([
    common_1.Module({
        modules: [upyun_module_1.UpyunModule, graphql_1.GraphQLModule, typeorm_1.TypeOrmModule.forRoot({
                name: 'upyun',
                type: 'postgres',
                host: 'localhost',
                port: 5433,
                username: 'postgres',
                password: '123456',
                database: "upyun",
                synchronize: true,
                dropSchema: true,
                logger: 'simple-console',
                logging: 'all',
                entities: ['../**/*.entity.ts']
            })],
        controllers: [],
        components: []
    }),
    __param(0, common_1.Inject(graphql_1.GraphQLFactory)),
    __metadata("design:paramtypes", [graphql_1.GraphQLFactory])
], ApplicationModule);
exports.ApplicationModule = ApplicationModule;
