import { defineAction } from 'astro:actions';
import { db, User } from 'astro:db';
import { z } from 'astro:schema';
import bcrypt from 'bcryptjs';
import { v4 as UUID } from 'uuid';

export const registerUser = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  handler: async ({ name, email, password }, { cookies }) => {

    const newUser = {
      id: UUID(),
      name,
      email,
      password: bcrypt.hashSync(password),
      role: "user"
    }

    try {

      const {rowsAffected} = await db.insert(User).values([newUser]);

      if (rowsAffected === 0) {
        return { ok: false, error: 'Error al registrar'};
      }

      return { ok: true };
      
    } catch (error) {
      console.log(error)

      throw new Error("Error al registrar"); 
    }
  },
});
