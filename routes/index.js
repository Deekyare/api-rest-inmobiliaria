const express = require("express");
const router = express.Router();

const propiedadesController = require("../controllers/propiedades");
const propiedadesFotosController = require("../controllers/propiedades_fotos");
const localidadesController = require("../controllers/localidades");

router.use("/propiedades", propiedadesController)
router.use("/propiedades-fotos", propiedadesFotosController)
router.use("/localidades", localidadesController)

module.exports = router;
