const express = require("express");
const siteController = require("../controllers/siteController");

const router = express.Router();

router.get("/create", siteController.post_create_get);
router.get("/", siteController.post_index);
router.post("/", siteController.post_create_post);
router.get("/:id", siteController.post_details);
router.delete("/:id", siteController.post_delete);

module.exports = router;
