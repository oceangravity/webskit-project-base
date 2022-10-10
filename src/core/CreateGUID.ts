import { nanoid } from "nanoid";

export const CreateGUID = (size = 5, complex = false): string => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  if (complex) {
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  } else {
    return nanoid(size);
  }
};
