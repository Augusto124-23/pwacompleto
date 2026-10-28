
import express from "express";
import { auth } from "../middleware/auth.js";
import {
    publicKey,
    subscribe,
    unsubscribe,
    test
} from "../controllers/push.controller.js";

const router = express.Router();

router.get("/public-key", publicKey);
router.post("/subscribe", auth, subscribe);
router.post("/unsubscribe", auth, unsubscribe);
router.post("/test", auth, test);

export default router;
