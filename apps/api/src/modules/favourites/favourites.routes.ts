import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getFavouritesController,
  addFavouriteController,
  removeFavouriteController,
} from "./favourites.controller.js";

export const favouritesRouter = Router();

favouritesRouter.use(authMiddleware);

favouritesRouter.get("/", getFavouritesController);
favouritesRouter.post("/:foodId", addFavouriteController);
favouritesRouter.delete("/:foodId", removeFavouriteController);
