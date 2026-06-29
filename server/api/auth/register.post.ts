import { readBody } from "h3";
import { createUser } from "~/server/db/queries";
import bcrypt from "bcrypt"; // Убедись, что он установлен: npm install bcrypt

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "Email and password required",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash);
    return { id: user.id, email: user.email };
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: "User already exists or DB error",
    });
  }
});
