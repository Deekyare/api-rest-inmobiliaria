const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

// CRUD
router.post("/", async function (req, res) {
  try {
    console.log("Creando una nueva localidad");

    const nombre = req.body?.nombre;

    if (!nombre) {
      res.status(500).json({
        error: "Debe especificar el nombre de la localidad",
      });
    }
    
    const query = `insert into localidades (nombre) values ("${nombre}")`;
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    throw err;
  }
});


router.get("/", async function (req, res) {
  try {
    console.log("Obteniendo todas las localidades");
    const data = await executeQuery("select * from localidades");
    res.json(data);
  } catch (err) {
    throw err;
  }
  
});

router.get("/:id", async function (req, res) {
  try {
    const idLocalidad = req.params.id;
    console.log(`Obteniendo la localidad con id: ${idLocalidad}`);
    const data = await executeQuery(`select * from localidades where id = ${idLocalidad}`);
    if (!data.length) {
      res.status(404).json({
        error: "Localidad no encontrado",
      });
    }
    res.json(data[0]);
  } catch (err) {
    throw err;
  }
});

router.put("/:id", async function (req, res) {
  try {
    const idLocalidad = req.params.id;
    console.log(`Editando la localidad con id: ${idLocalidad}`);
    
    const registros = await executeQuery(`select * from localidades where id = ${idLocalidad}`);

    if (!registros.length) {
      res.status(404).json({
        error: "Localidad no encontrado",
      });
    }

    const nombre = req.body.nombre;
    if (!nombre) {
      res.status(500).json({
        error: "Debe especificar el nombre",
      });
    }

    const query = `update localidades set nombre = "${nombre}" where id = ${nombre}`;

    await executeQuery(query);
    res.json({
      mensaje: "La localidad se modificó correcamente"
    });
  } catch (err) {
    throw err;
  }
});

router.delete("/:id", async function (req, res) {
  const idLocalidad = req.params.id;
  console.log(`Eliminando la localidad con id: ${idLocalidad}`);
  const registros = await executeQuery(`select * from localidades where id = ${idLocalidad}`);

  if (!registros.length) {
    res.status(404).json({
      error: "Localidad no encontrado",
    });
  }

  try {
    await executeQuery(`delete from localidades where id = ${idLocalidad}`)
    res.json({
      mensaje: 'La localidad se eliminó correctamente'
    })
  } catch (err) {
    throw err;
  }
});

module.exports = router;