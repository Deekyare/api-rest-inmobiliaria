const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

// CRUD
router.post("/", async function (req, res) {
  try {
    console.log("Creando una nuev propiedad", { data: req.body });

    if (!req.body) {
      res.status(500).json({
        error: "Debe especificar al menos un parámetro",
      });
    }

    const {
      superficie,
      habitaciones = 0,
      valor = 0,
      id_localidad = 1,
      estado,
      titulo,
      descripcion,
      operacion,
      tipo_propiedad,
    } = req.body;

    const query = `insert into propiedades (superficie, habitaciones, valor, id_localidad, estado, titulo, descripcion, operacion, tipo_propiedad) values (${superficie}, ${habitaciones}, ${valor}, ${id_localidad}, "${estado}", "${titulo}", "${descripcion}"," ${operacion}", "${tipo_propiedad}")`;
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    throw err;
  }
});

router.get("/", async function (req, res) {
  try {
    console.log("Obteniendo todos los propiedades");

    let query = "select * from propiedades";
    const where = [];

    const operacion = req.query.operacion;
    if (operacion) {
      where.push(`operacion = "${operacion}"`);
    }

    const idLocalidad = req.query.id_localidad;
    if (idLocalidad) {
      where.push(`id_localidad = ${idLocalidad}`);
    }

    const tipo_propiedad = req.query.tipo_propiedad;

    if (tipo_propiedad) {
      where.push(`tipo_propiedad = "${tipo_propiedad}"`);
    }

    const valor_minimo = req.query.valor_min;

    if (valor_minimo) {
      where.push(`valor >= ${valor_minimo}`);
    }


    const valor_maximo = req.query.valor_max;

    if (valor_maximo) {
      where.push(`valor <= ${valor_maximo}`);
    }

    if (where.length) {
      query = `${query} where ${where.join(" and ")}`;
    }

    console.log({ query });

    // Cargar los filtros que vienen en req.query (Ej: req.query.operacion)
    // Si vienen filtros hay que agregarlos a la consulta (Ej: select * from propiedades where operacion = "${req.query.operacion}")

    const data = await executeQuery(query);

    // Obtener todas las localidades para poder incluir el nombre de la localidad en el objeto de la propiedad
    const localidades = await executeQuery("select * from localidades");

    if (data.length) {
      for (const propiedad of data) {
        // Inyectar todas las fotos de cada propiedad buscando por el id de la propiedad en la base de datos
        const fotos = await executeQuery(
          `select * from propiedades_fotos where id_propiedad = ${propiedad.id}`
        );
        propiedad.fotos = fotos.map((foto) => foto.url_foto);

        // Inyectar el nombre de la localidad buscandola por su id en el listado de localidades
        propiedad.localidad = localidades.find(
          (localidad) => localidad.id === propiedad.id_localidad
        ).nombre;
      }
    }

    res.json(data);
  } catch (err) {
    throw err;
  }
});

router.get("/:id", async function (req, res) {
  try {
    const idPropiedad = req.params.id;

    if (!idPropiedad) {
      res.status(404).json({
        error: "Propiedad no encontrada",
      });
    }

    console.log(`Obteniendo la propiedad con el id: ${idPropiedad}`);
    const data = await executeQuery(
      `select * from propiedades where id = ${idPropiedad}`
    );
    if (!data.length) {
      res.status(404).json({
        error: "Propiedad no encontrada",
      });
    }

    const propiedad = data[0];

    if (!propiedad) {
      res.status(404).json({
        error: "Propiedad no encontrada",
      });
    }

    // Obtener todas las localidades para poder incluir el nombre de la localidad en el objeto de la propiedad
    if (propiedad.id_localidad) {
      const localidades = await executeQuery(
        `select * from localidades where id = ${propiedad.id_localidad}`
      );
      // Inyectar el nombre de la localidad buscandola por su id en el listado de localidades
      propiedad.localidad = localidades[0].nombre;
    }

    // Inyectar todas las fotos de cada propiedad buscando por el id de la propiedad en la base de datos
    const fotos = await executeQuery(
      `select * from propiedades_fotos where id_propiedad = ${propiedad.id}`
    );
    propiedad.fotos = fotos.map((foto) => foto.url_foto);


    res.json(data[0]);
  } catch (err) {
    throw err;
  }
});

router.put("/:id", async function (req, res) {
  try {
    const idPropiedad = req.params.id;
    console.log(`Editando la propiedad con id: ${idPropiedad}`);

    const registros = await executeQuery(
      `select * from propiedades where id = ${idPropiedad}`
    );

    if (!registros.length) {
      res.status(404).json({
        error: "Propiedad no encontrada",
      });
    }

    // Creamos un array para insertar las subconsultas de cada campo que se debe actualizar
    const updates = [];
    const {
      superficie,
      habitaciones,
      valor,
      estado,
      titulo,
      descripcion,
      operacion,
      tipo_propiedad,
      id_localidad,
      foto
    } = req.body;

    if (superficie) {
      updates.push(`superficie = ${superficie}`);
    }

    if (habitaciones) {
      updates.push(`habitaciones = "${habitaciones}"`);
    }

    if (valor) {
      updates.push(`valor = ${valor}`);
    }

    if (estado) {
      updates.push(`estado = "${estado}"`);
    }

    if (titulo) {
      updates.push(`titulo = "${titulo}"`);
    }

    if (descripcion) {
      updates.push(`descripcion = "${descripcion}"`);
    }

    if (operacion) {
      updates.push(`operacion = "${operacion}"`);
    }

    if (tipo_propiedad) {
      updates.push(`tipo_propiedad = "${tipo_propiedad}"`);
    }

    if (id_localidad) {
      updates.push(`id_localidad = ${id_localidad}`);
    }

    if (!updates.length) {
      res.json({ error: "No se incluyeron parametros" });
    }

    const query = `update propiedades set ${updates.join(", ")} where id = ${
      req.params.id
    }`;

    await executeQuery(query);

    if (foto) {
      const fotoExistente = await executeQuery(`select * from propiedades_fotos where id_propiedad = ${idPropiedad} and url_foto = "${foto}"`);

      if (!fotoExistente.length) {
        await executeQuery(`insert into propiedades_fotos (id_propiedad, url_foto) values (${idPropiedad}, "${foto}")`); 
      }
    }

    res.json({
      mensaje: "La propiedad se modificó correcamente",
    });
  } catch (err) {
    throw err;
  }
});

router.delete("/:id", async function (req, res) {
  const idPropiedad = req.params.id;
  console.log(`Eliminando la propiedad con id: ${idPropiedad}`);

  const registros = await executeQuery(
    `select * from propiedades where id = ${idPropiedad}`
  );

  if (!registros.length) {
    res.status(404).json({
      error: "Propiedad no encontrado",
    });
  }

  try {
    await executeQuery(`delete from propiedades where id = ${idPropiedad}`);
    res.json({
      mensaje: "La propiedad se eliminó correctamente",
    });
  } catch (err) {
    throw err;
  }
});

module.exports = router;
