import { z } from "zod";
import userSchema from "./user.schema.js";

const adminSchema = userSchema.extend({
  roles: 
});

export default aulaSchema;