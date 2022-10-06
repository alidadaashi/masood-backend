import { Request } from "express";
import { UserSessionType } from "../types/tpShared";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";

class SrSession {
  static saveSession(
    req: Request,
    sessionData: UserSessionType,
  ): void {
    req.session.user = sessionData;
  }

  static destroySession(req: Request, cb?: (err: Error | null) => void): void {
    if (req.session.user) {
      req.session.destroy((err) => {
        if (err) throw new MdUnprocessableEntityError(err);
        if (cb) cb(err);
      });
    } else if (cb) cb(null);
  }
}

export default SrSession;
