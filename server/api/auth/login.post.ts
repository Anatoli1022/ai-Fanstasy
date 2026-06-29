export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password required",
    });
  }

  const { getUserByEmail } = await import("../../db/queries");
  const user = await getUserByEmail(email);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  const hashed = Buffer.from(password).toString("base64");
  if (user.passwordHash !== hashed) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  const token = `${user.id}:${Date.now()}`; // use JWT in real app
  return { token, user: { id: user.id, email: user.email } };
});
