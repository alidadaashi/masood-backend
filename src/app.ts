import "regenerator-runtime/runtime";
import "core-js/stable";
import expressApp, {
  Errback, NextFunction, Request, Response,
} from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import path from "path";
import cookieParser from "cookie-parser";
import * as qs from "qs";
import bodyParser from "body-parser";
import knex from "./base/database/cfgKnex";
import { AppEnv, cfgIsEnv } from "./base/loaders/cfgBaseLoader";
import MdBaseError from "./base/errors/mdBaseError";
import MdMessage from "./base/models/mdMessage";
import appRoutes from "./routes/rtApp";
import SrWebSocket from "./module/shared/services/srWebSocket";
import { MESSAGE_SOME_THING_WENT_WRONG, WS_SESSION_TYPE } from "./module/shared/constants/dtOtherConstants";
import SrRedis from "./module/shared/services/srRedis";
import MdUnprocessableEntityError from "./base/errors/mdUnprocessableEntityError";

const express = expressApp();

express.set("query parser", (str: string) => qs.parse(str, { arrayLimit: 100 }));

const RedisStore = connectRedis(session);
const { redisClient } = SrRedis.get();

console.log(process.env.NODE_ENV, "ENV");

express.enable("trust proxy");
express.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000,
}));
express.use(bodyParser.json({ limit: "50mb" }));
express.use(cookieParser());
express.set("json spaces", 2);
express.use("/public", expressApp.static(
  path.resolve(path.join((process.env as {NODE_PATH: string}).NODE_PATH, "public")),
));

express.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || "";
  if (!origin || origin === "null" || AppEnv.allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers",
      "Content-Type, Authorization, Origin, X-Requested-With,Accept, x-api-version, x-csrf-token, cache-control, pragma");
    res.header("Access-Control-Allow-Credentials", "true");
    return next();
  }
  return res.status(400)
    .json("{Either login, or use API key}")
    .end();
});

express.use(session({
  secret: AppEnv.session.secret,
  name: AppEnv.session.cookieName,
  resave: true,
  saveUninitialized: false,
  cookie: { secure: false },
  store: new RedisStore({
    host: AppEnv.session.redis.host,
    port: AppEnv.session.redis.port,
    client: redisClient,
    ttl: AppEnv.session.expireInMin * 60000,
  }),
}));

redisClient.on("error", (err: Errback) => {
  console.log("Redis error: ", err);
});

express.use((_req, res, next) => {
  res.sendList = (data: unknown, message?: string) => {
    res.json({
      data,
      message,
    });
  };
  res.sendObject = (data: unknown, message?: string) => {
    res.json({
      data,
      message,
    });
  };
  res.sendMsg = (message: string) => {
    res.json({ message });
  };
  res.sendString = (str: string) => res.send(str);
  next();
});

express.use("/api", appRoutes);
express.get("/reset-db", async (_req, res, next) => {
  if (cfgIsEnv("testing")) {
    console.log("resetting db...");
    await knex.migrate.rollback();
    await knex.migrate.latest();
    await knex.seed.run();
    console.log("db reset...");
    res.status(200)
      .end();
  } else {
    next(new MdUnprocessableEntityError("The route is only valid for test build"));
  }
});
express.get("/attachment", (req: Request, res: Response) => {
  const pathTo = path.resolve(req.query.path as string);
  res.download(pathTo);
});

express.use((err: Errback, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  if ("getErrorCode" in err) {
    const e = err as unknown as MdBaseError;
    res.status(e.getErrorCode())
      .json(new MdMessage(e.getErrorMessage()));
  } else {
    res.status(422)
      .json(new MdMessage(MESSAGE_SOME_THING_WENT_WRONG));
  }
});

knex.raw("select 1+1 as result")
  .then(() => {
    console.log("Postgres Database Connected");
    express.listen(AppEnv.port, () => {
      console.log(`Server is running on port ${AppEnv.port}`);
    });
    console.log(`Websocket is running on port ${AppEnv.webSocket.port}`);

    SrWebSocket.get()
      .getWs
      .on("connection", (ws) => {
        ws.on("message", (message) => {
          if (message) {
            const data = JSON.parse(message as string) as { type: string, payload: { sid: string } };
            if (data.type === WS_SESSION_TYPE && typeof data.payload === "object") {
              SrWebSocket.get()
                .setClient(`sess:${data.payload.sid}`, ws);
              console.log("socket request received...");
            }
          }
        });
      });
  })
  .catch(console.log);

module.exports = express;
