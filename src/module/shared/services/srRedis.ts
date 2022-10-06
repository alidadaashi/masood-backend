import redis, { RedisClient } from "redis";
import { UserSessionType } from "../types/tpShared";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { utIsValidJson } from "../utils/utString";

class SrRedis {
  private static instance: SrRedis;
  private redisClientObj: RedisClient;

  constructor() {
    this.redisClientObj = redis.createClient();
  }

  public static get(): SrRedis {
    if (!SrRedis.instance) {
      SrRedis.instance = new SrRedis();
    }
    return this.instance;
  }

  get redisClient(): RedisClient {
    return this.redisClientObj;
  }

  static async getAllSessionKeys():Promise<string[]> {
    return new Promise((res, rej) => SrRedis.get()
      .redisClient
      .keys("*", (err, v) => (err ? rej(err) : res(v))));
  }

  static async getSessionByValue(cb: (
    data: { user: UserSessionType }) => boolean): Promise<{ key: string, value: { user: UserSessionType } } | null> {
    try {
      const keys: string[] = await SrRedis.getAllSessionKeys();
      if (keys?.length) {
        let returnValue: { key: string, value: unknown } | null = null;
        await Promise.all(keys.map(async (key) => {
          if (!returnValue) {
            const sessionDataByKey: string = await new Promise((res1, rej1) => SrRedis.get()
              .redisClient
              .get(key, (err, value) => (err ? rej1(err) : res1(value as string))));
            if (sessionDataByKey && utIsValidJson(sessionDataByKey)) {
              const parsedData = JSON.parse(sessionDataByKey);
              const isFound = cb(parsedData);
              if (isFound) {
                returnValue = {
                  key,
                  value: parsedData,
                };
              }
            }
          }
        }));

        return returnValue;
      }
    } catch (err) {
      throw new MdUnprocessableEntityError(`Redis error {getSessionByValue} ${err}`);
    }
    return null;
  }
}

export default SrRedis;
