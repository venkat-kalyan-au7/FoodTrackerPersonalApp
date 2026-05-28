import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createUserSupabaseClient } from "../../integrations/supabase/client.js";
import { createError } from "../../middleware/error.middleware.js";
import { config } from "../../config/index.js";

const ALLOWED_TYPES = config.upload.allowedTypes;
const MAX_BYTES = config.upload.maxSizeBytes;
const BUCKET = "food-images";

async function uploadFile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  pathPrefix: string
) {
  try {
    if (!req.file) {
      return next(createError("No file uploaded", 400));
    }

    const { mimetype, buffer, originalname, size } = req.file;

    if (!ALLOWED_TYPES.includes(mimetype)) {
      return next(
        createError(
          `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
          400
        )
      );
    }

    if (size > MAX_BYTES) {
      return next(
        createError(`File too large. Max size: ${config.upload.maxSizeMb}MB`, 400)
      );
    }

    const ext = originalname.split(".").pop() ?? "jpg";
    const filePath = `${pathPrefix}/${req.userId!}/${Date.now()}.${ext}`;

    const supabase = createUserSupabaseClient(req.userToken!);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      return next(createError("File upload failed: " + error.message, 500));
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    res.json({ success: true, data: { url: urlData.publicUrl, path: filePath } });
  } catch (err) {
    next(err);
  }
}

export async function uploadProfileImageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return uploadFile(req as AuthenticatedRequest, res, next, "profile");
}

export async function uploadFoodImageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return uploadFile(req as AuthenticatedRequest, res, next, "foods");
}

export async function uploadRecipeImageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return uploadFile(req as AuthenticatedRequest, res, next, "recipes");
}

export async function uploadLogImageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return uploadFile(req as AuthenticatedRequest, res, next, "logs");
}
