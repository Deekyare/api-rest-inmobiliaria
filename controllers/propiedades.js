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
      localidad = 1,
      estado,
      titulo,
      descripcion,
      operacion,
      tipoProp,
      foto
    } = req.body; 

    const query = `insert into propiedades (superficie, habitaciones, valor, id_localidad, estado, titulo, descripcion, operacion, tipo_propiedad) values (${superficie}, ${habitaciones}, ${valor}, ${localidad}, "${estado}", "${titulo}", "${descripcion}"," ${operacion}", "${tipoProp}")`;
    const data = await executeQuery(query);

    if (foto) {
      console.log(data);
      const queryFoto = `insert into propiedades_fotos (id_propiedad, url_foto) values (${data.insertId}, "${foto}")`;
      await executeQuery(queryFoto);
    }

    res.json(data);
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Ocurrio un error al crear la propiedad" });
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
    console.error(err)
    res.status(500).send({ message: "Ocurrio un error al obtener las propiedades" });
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
    console.error(err)
    res.status(500).send({ message: "Ocurrio un error al obtener la propiedade" });
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
      tipoProp,
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

    if (tipoProp) {
      updates.push(`tipo_propiedad = "${tipoProp}"`);
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
      const fotoExistente = await executeQuery(`select * from propiedades_fotos where id_propiedad = ${idPropiedad}`);

      if (!fotoExistente.length) {
        console.log("Creando la foto", foto)
        await executeQuery(`insert into propiedades_fotos (id_propiedad, url_foto) values (${idPropiedad}, "${foto}")`); 
      } else {
        console.log("Actualizando la foto", foto)
        await executeQuery(`update propiedades_fotos set url_foto = "${foto}" where id_propiedad = ${idPropiedad}`); 
      }
    }

    res.json({
      mensaje: "La propiedad se modificó correcamente",
    });
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Ocurrio un error al modificar la propiedad" });
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
    console.error(err)
    res.status(500).send({ message: "Ocurrio un error al eliminar la propiedad" });
  }
});

module.exports = router;
