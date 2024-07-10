const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

// CRUD 
router.post("/", async function (req, res) {
  try {
    console.log("Agregando foto a la propiedad");

    if (!req.body) {
      res.status(500).json({
        error: "Debe especificar al menos un parámetro",
      });
    }

    const { id_propiedad, url_foto } = req.body;

    if (!id_propiedad || !url_foto) {
      res.status(500).json({
        error: "Debe especificar el id de la propiedad y la url de la foto",
      });
    }
    const query = `insert into propiedades_fotos (id_propiedad, url_foto) values ("${id_propiedad}", "${url_foto}")`;
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    throw err;
  }
});

router.get("/", async function (req, res) {
  try {
    console.log("Obteniendo todas las fotos");
    const data = await executeQuery("select * from propiedades_fotos");
    res.json(data);
  } catch (err) {
    throw err;
  }
});

router.get("/:id", async function (req, res) {
  try {
    const idFoto = req.params.id;
    console.log(`Obteniendo las fotos con id: ${idFoto}`);
    const data = await executeQuery(
      `select * from propiedades_foto where id = ${idFoto}`
    );
    if (!data.length) {
      res.status(404).json({
        error: "Fotos no encontradas",
      });
    }
    res.json(data[0]);
  } catch (err) {
    throw err;
  }
});

router.put("/:id", async function (req, res) {
  try {
    const idFoto = req.params.id;
    console.log(`Editando las fotos con id: ${idFoto}`);

    const registros = await executeQuery(
      `select * from propiedades_fotos where id = ${idFoto}`
    );

    if (!registros.length) {
      res.status(404).json({
        error: "Foto no encontrada",
      });
    }

    // Creamos un array para insertar las subconsultas de cada campo que se debe actualizar
    const updates = [];

    // Si id_inmueble es parte del payload agregamos la subconsulta correspondiente al array de updates
    const idPropiedad = req.body.id_propiedad;
    if (idInmueble) {
      updates.push(`id_propiedad = ${idPropiedad}`);
    }

    // Si valor es parte del payload agregamos la subconsulta correspondiente al array de updates
    const url_foto = req.body.url_foto;
    if (url_foto) {
      updates.push(`url_foto = ${url_foto}`);
    }

    if (!updates.length) {
      res.json({ error: "No se incluyeron parametros" });
    }

  
    const query = `update propiedades_fotos set ${updates.join(
      ", "
    )} where id = ${idFoto}`;
 
    await executeQuery(query);
    res.json({
      mensaje: "La publicación se modificó correcamente",
    });
  } catch (err) {
    throw err;
  } 
});

router.delete("/:id", async function (req, res) {
  console.log(`Eliminando la foto con id: ${req.params.id}`);
  const idFoto = req.params.id;
  const registros = await executeQuery(
    `select * from propiedades_fotos where id = ${idFoto}`
  );

  if (!registros.length) {
    res.status(404).json({
      error: "Foto no encontrado",
    });
  }

  try {
    await executeQuery(`delete from propiedades_fotos where id = ${idFoto}`);
    res.json({  
      mensaje: "La foto se eliminó correctamente",
    });
  } catch (err) {
    throw err;
  }
});

module.exports = router;
