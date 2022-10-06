import MdBaseError from "./mdBaseError";

class MdUnprocessableEntityError extends MdBaseError {
  constructor(message: string) {
    super(message, 422, "UnprocessableEntityError");
  }
}

export default MdUnprocessableEntityError;
