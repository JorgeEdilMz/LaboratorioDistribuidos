import { Router } from "express";
import {orm} from "../db.js"
import bcrypt from 'bcrypt';

const router = Router();

const elementosPorPagin = 10; // Cambia esto según tus necesidades
const paginaPredeterminada = 1; // Página inicial

router.get('/connection', async (req, res) => {
    try {
        const { pagina = paginaPredeterminada, elementos = elementosPorPagin } = req.query;
        const paginaActual = parseInt(pagina);
        const elementosPorPagina = parseInt(elementos); // Aquí estaba el error

        // Calcula el índice de inicio y fin para la paginación
        const startIndex = (paginaActual - 1) * elementosPorPagina;

        // Realiza la consulta a la base de datos para obtener los elementos de la página actual
        const connections = await orm.usuarios_roles.findMany({
            skip: startIndex,
            take: elementosPorPagina,
        });

        if (connections.length !=0) {
            res.json(connections);
        }else{
            // Envía la respuesta con los elementos de la página actual
            res.status(204).json({ info: "Not content" });
        }
        
    } catch (error) {
        console.error("Error fetching connections:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




router.get('/connection/:id', async (req, res) => {
    try {
        const connectionFound = await orm.usuarios_roles.findFirst({
            where: {
                id_usuario: parseInt(req.params.id)
            }
        });

        if (!connectionFound) {
            return res.status(404).json({ error: "Connection not found" });
        }

        res.json(connectionFound);
    } catch (error) {
        console.error("Error fetching connection:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/connection/:id/:id_rol', async (req, res) => {
    try {
        const usuarioID = parseInt(req.params.id);
        
        const idRol = parseInt(req.params.id_rol);

        // Elimina el usuario por su ID_PERSONA y el ID_ROL proporcionado en la ruta
        const deleteResult = await orm.usuarios_roles.delete({
            where: {
                id_usuario_id_rol: {
                    id_usuario: usuarioID,
                    id_rol: idRol,
                }
            }
        });

        if (deleteResult) {
            res.json({ info: "Connection deleted successfully" });
        } else {
            res.status(404).json({ error: "Connection not found" });
        }
    } catch (error) {
        console.error("Error deleting connection:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});





router.put('/connection/:id', async (req, res) => {
    try {
        const connectionUpdate = await orm.usuarios_roles.update({
            where: {
                id_usuario: parseInt(req.params.id)
            },
            data: req.body
        });

        if (connectionUpdate === null) {
            return res.status(404).json({ error: "Connection not found" });
        }

        return res.json({ info: "Connection updated successfully" });
    } catch (error) {
        console.error("Error updating connection:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
   

//registro
router.post('/connection', async (req, res) => {
    try {
        const {id_usuario, id_rol, nick_usuario, password_usuario } = req.body;

        // Genera un hash de la contraseña
        const hashedPassword = await bcrypt.hash(password_usuario, 10); // "10" es el costo de la encriptación

        // Crea un nuevo usuario con la contraseña encriptada
        const newConnection = await orm.usuarios_roles.create({
            data: {
                id_usuario,
                id_rol,
                nick_usuario,
                password_usuario: hashedPassword// Almacena el hash en la base de datos
            }
        });
        
        res.status(200).json({ info: "Connection created!" });
    } catch (error) {
        console.error("Error creating connection:", error);
        return res.status(400).json({ error: "User connection could not be created." });
    }
});


//LOGIN

router.post('/login', async (req, res) => {
    try {
        const { nombre_usuario, password_usuario } = req.body;

        const logueo = await orm.usuarios_roles.findFirst({
            where: {
                nick_usuario: nombre_usuario
            }
        });

        if (!logueo) {
            res.status(404).json({ error: "Username not found" });
        } else {
            // Compara el hash de la contraseña ingresada con el hash almacenado
            const passwordMatch = await bcrypt.compare(password_usuario, logueo.password_usuario);

            if (passwordMatch) {
                res.status(200).json({ message: "Login successful" });
            } else {
                res.status(401).json({ error: "Incorrect password" });
            }
        }
    } catch (error) {
        console.error("Error en el bloque catch:", error);
        res.status(500).json({ error: "Internal server error not connection" });
    }
});


export default router;