import { ObjectId } from "mongodb";

export const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
};

export const now = () => new Date();