import { ImageUpload } from "@/utils/image-upload";
import { defineAction } from "astro:actions";
import { db, eq, ProductImage } from "astro:db";
import { z } from "astro:schema";
import { getSession } from 'auth-astro/server';

export const deleteProductImage = defineAction({
    accept: 'json',
    input: z.string(),
    handler: async (imageId, { request }) => {

        const session = await getSession(request);

        const user = session?.user;

        if (!user || user.role !== 'admin') throw new Error("Unauthorized");

        const [productImage] = await db.select().from(ProductImage).where(eq(ProductImage.id, imageId));

        if (!productImage) throw new Error(`Image with id ${imageId} not found`);

        const { rowsAffected } = await db.delete(ProductImage).where(eq(ProductImage.id, productImage.id));

        if (rowsAffected < 1) throw new Error(`Image with id ${imageId} not found`);

        //! ELIMINAR LA IMAGEN CUANDO ES DE CLOUDINARY
        if (productImage.image.includes('cloudinary')) {
            await ImageUpload.delete(productImage.image);
        }

        return { ok: true };
    }
});