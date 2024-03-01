import { Router } from "express";
import { orm } from "../db.js"
import * as auth from '../authToken.js';

import multer from 'multer';
import azureStorage from 'azure-storage';
import getStream from 'into-stream';

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('image');
const blobService = azureStorage.createBlobService();
const containerName = 'imagenes';

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, '');
    return `${identifier}-${originalName}`;
};

const router = Router();

router.post('/upload/:documento_usuario', uploadStrategy, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const blobName = getBlobName(req.file.originalname);
        const stream = getStream(req.file.buffer);

        // Sube la imagen al contenedor en Azure Blob Storage
        blobService.createBlockBlobFromStream(containerName, blobName, stream, req.file.size, async (error, result, response) => {
            if (error) {
                console.error('Error uploading image to Azure Blob Storage:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // URL de acceso a la imagen recién cargada
            const imageUrl = blobService.getUrl(containerName, blobName);
            const userId = parseInt(req.params.documento_usuario);
            try {
                const updatedUser = await orm.usuarios.update({
                    where: { documento_usuario: userId },
                    data: {
                        foto_usuario: imageUrl
                    }
                });

                if (updatedUser) {
                    res.status(200).json({ Message: 'Imagen subida con éxito' });
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            } catch (updateError) {
                console.error('Error updating user:', updateError);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const elementosPorPagin = 20; // Cambia esto según tus necesidades
const paginaPredeterminada = 1; // Página inicial

router.get('/users/count', async (req, res) => {
    try {
        const number = await orm.usuarios.count({})
        if (number != 0) {
            res.status(200).json(number)
        } else {
            res.status(204).json({ info: "Not content" })
        }
    } catch (error) {
        console.error("Error counting users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



router.get('/users', async (req, res) => {
    try {
        const { pagina = paginaPredeterminada, elementos = elementosPorPagin } = req.query;
        const paginaActual = parseInt(pagina);
        const elementosPorPagina = parseInt(elementos); // Aquí estaba el error

        // Calcula el índice de inicio y fin para la paginación
        const startIndex = (paginaActual - 1) * elementosPorPagina;

        // Realiza la consulta a la base de datos para obtener los elementos de la página actual
        const users = await orm.usuarios.findMany({
            skip: startIndex,
            take: elementosPorPagina,
            include: {
                tipo_documentos: true
            }
        });

        if (users.length != 0) {
            res.json(users);
        } else {

            // Envía la respuesta con los elementos de la página actual
            res.status(204).json({ info: "Not content" });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/users/:id', async (req, res) => {
    try {

        const foundUser = await orm.usuarios.findFirst({
            where: {
                documento_usuario: parseInt(req.params.id)

            },
            include: {
                tipo_documentos: true
            }
        });

        if (!foundUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(foundUser);
    } catch (error) {
        console.error("Error fetching User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.get('/users/any/:value', auth.authenticateToken, async (req, res) => {
    try {
        const val = req.params.value
        const foundUser = await orm.usuarios.findFirst({
            where: {
                OR: [
                    {
                        nombre_usuario: val
                    },
                    {
                        apellido_usuario: val
                    }
                ]

            },
            include: {
                tipo_documentos: true
            }
        });

        if (!foundUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(foundUser);
    } catch (error) {
        console.error("Error fetching User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/users/:id', auth.authenticateToken, async (req, res) => {
    try {

        // Elimina el usuario por su ID_PERSONA y el ID_ROL proporcionado en la ruta
        const deleteResult = await orm.usuarios.delete({
            where: {
                documento_usuario: parseInt(req.params.id)
            }
        });

        if (deleteResult) {
            res.json({ info: "User deleted successfully" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Error deleting User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.put('/users/:id', auth.authenticateToken, async (req, res) => {
    try {
        const UserUpdate = await orm.usuarios.update({
            where: {
                documento_usuario: parseInt(req.params.id)
            },
            data: req.body
        });

        if (UserUpdate === null) {
            res.status(404).json({ error: "User not found" });
        } else {
            res.json({ info: "User updated successfully" });
        }

    } catch (error) {
        console.error("Error updating User:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/users', async (req, res) => {
    try {
        const newConnection = await orm.usuarios.create({
            data: req.body
        });

        res.status(200).json({ info: "User created!" });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(400).json({ error: "User could not be created." });
    }
});



router.patch('/users/:document/status', auth.authenticateToken, async (req, res) => {
    const { estado_usuario } = req.body;
    const stateUser = await orm.usuarios.update({
        where: {
            documento_usuario: parseInt(req.params.document)
        },
        data: {
            estado_usuario: estado_usuario
        }
    })
    if (!stateUser)
        return res.status(404).json({ error: "User not found" })
    return res.status(200).json({ message: "Modified successfully" })
});

//Funcion para obtener unicamente los campos que se cambiaron en front
function validateUpdateFields(updates) {
    const validFields = {};

    for (const key in updates) {
        if (updates[key] !== null && updates[key] !== '') {
            validFields[key] = updates[key];
        }
    }

    return validFields;
}

router.patch('/users/:document/update', auth.authenticateToken, async (req, res) => {
    const updates = req.body; // Objeto que contiene solo los campos que han cambiado en front

    const document = parseInt(req.params.document);
    const user = await orm.usuarios.findFirst({
        where: {
            documento_usuario: document
        }
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const validFields = validateUpdateFields(updates);

    if (Object.keys(validFields).length === 0) {
        return res.status(400).json({ error: 'No se puede actualizar usuario' });
    }

    // Llama a la función de actualización con los campos válidos
    await updateUserInDatabase(document, validFields);

    return res.status(200).json({ message: 'Usuario modificado exitosamente' });
});

async function updateUserInDatabase(document, updates) {
    await orm.usuarios.update({
        where: {
            documento_usuario: document
        },
        data: updates
    });
}


//GMAIL

router.get('/users/email/superadmin', async (req, res) => {
    try {
        const users = await orm.usuarios.findMany({
            include: {
                usuarios_roles: true
            },
            where: {
                usuarios_roles: {
                    some: {
                        id_rol: 2 // Reemplaza 'tuID' con el ID que estás buscando superadmin(2)
                    }
                }
            }

        });

        const direcciones = users.map(user => user.direccion_usuario);

        res.json(direcciones);

    } catch (error) {
        console.error("Error emails fetching", error);
        res.status(500).json({ error: "Error emails fetching" });
    }
});



router.get('/users/email/date', async (req, res) => {
    try {
        const fecha = new Date();
        const fechaISO = fecha.toISOString();
        const fechaSinHora = fechaISO.split('T')[0];

        res.json({ fecha: fechaSinHora });

    } catch (error) {
        console.error("Error in date", error);
        res.status(500).json({ error: "Error in date" });
    }
});



//obtiene los usuarios creados en una fecha especifica
router.get('/users/email/created/:date', async (req, res) => {
    try {
        const date = new Date(req.params.date)

        const usersCreated = await orm.usuarios.findMany({
            where: {
                fecha_registro_usuario: date
            }

        });



        res.json(usersCreated);

    } catch (error) {
        console.error("Error in users created dates", error);
        res.status(500).json({ error: "Error in users created dates" });
    }
});

export default router;