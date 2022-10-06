type ListResponseType = <T> (list: {
  list: T[],
  total?: number,
  allIds?: string[]
}, message?: string,) => void

type ObjectResponseType = <T> (obj: T, message?: string) => void;

type MessageResponseType = (message: string) => void;

type StringResponseType = (string: string) => void;
