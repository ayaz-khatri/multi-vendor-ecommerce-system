import express from 'express';
const router = express.Router();
import profileController from '../controllers/profileController.js';

router.get("/", (req, res) => {
    res.render("frontend/index", { title: "Home" });
});

export default router;
