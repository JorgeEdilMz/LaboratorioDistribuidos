import { Router } from "express";
import { orm } from "../db.js"
import bcrypt from 'bcrypt';
import * as auth from '../authToken.js';

const router = Router();

const elementosPorPagin = 20; // Cambia esto según tus necesidades
const paginaPredeterminada = 1; // Página inicial

router.get('/connection/count', auth.authenticateToken, async (req, res) => {
    try {
        const number = await orm.usuarios_roles.count({})
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


router.get('/connection', auth.authenticateToken, async (req, res) => {
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
            include: {
                roles: true
            }
        });

        if (connections.length != 0) {
            res.json(connections);
        } else {
            // Envía la respuesta con los elementos de la página actual
            res.status(204).json({ info: "Not content" });
        }

    } catch (error) {
        console.error("Error fetching connections:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




router.get('/connection/:id', auth.authenticateToken, async (req, res) => {
    try {
        const connectionFound = await orm.usuarios_roles.findFirst({
            where: {
                id_usuario: parseInt(req.params.id)
            },
            include: {
                roles: true
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

router.get('/connection/nickname/:nickname', auth.authenticateToken, async (req, res) => {
    try {
        const connectionFound = await orm.usuarios_roles.findFirst({
            where: {
                nick_usuario: req.params.nickname
            },
            include: {
                roles: true,
                usuarios: true
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

router.get('/connection/exists/:nickname', async (req, res) => {
    try {
        const existingUser = await orm.usuarios_roles.findFirst({
            where: {
                nick_usuario: req.params.nickname,
            },
        });

        if (existingUser) {
            // Si se encuentra un usuario con el mismo nickname, significa que ya está registrado
            res.json({ exists: true });
        } else {
            // Si no se encuentra un usuario con el mismo nickname, está disponible
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error al comprobar el nickname:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});
router.delete('/connection/:id/:id_rol', auth.authenticateToken, async (req, res) => {
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

//edita por nick una conexion
router.put('/connection/:nick', auth.authenticateToken, async (req, res) => {
    try {
        const connectionUpdate = await orm.usuarios_roles.update({
            where: {
                nick_usuario: req.params.nick
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


//registro de conexion
router.post('/connection', auth.authenticateToken, async (req, res) => {
    try {
        const { id_usuario, id_rol, nick_usuario, password_usuario } = req.body;

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

router.post('/connection/post', async (req, res) => {
    try {
        const { id_usuario,nick_usuario, password_usuario } = req.body;

        // Genera un hash de la contraseña
        const hashedPassword = await bcrypt.hash(password_usuario, 10); // "10" es el costo de la encriptación

        // Crea un nuevo usuario con la contraseña encriptada
        const newConnection = await orm.usuarios_roles.create({
            data: {
                id_usuario,
                id_rol:3,
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

router.post('/connection/admin', auth.authenticateToken, async (req, res) => {
    try {
        const { id_usuario, id_rol, nick_usuario, password_usuario } = req.body;

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
                nick_usuario: nombre_usuario,
            }

        });
        if (logueo === null) {
            res.status(404).json({ error: "Username not found" });
        } else {
            if (nombre_usuario === logueo.nick_usuario) {//Validar mayusculas y minusculas
                // Compara el hash de la contraseña ingresada con el hash almacenado
                if (password_usuario == logueo.password_usuario){
                    //aqui token
                    const token = auth.generateToken({
                        nick_usuario: logueo.nick_usuario,
                        password_usuario: logueo.password_usuario
                    })
                    res.status(200).json({ status: true, info: "Login Successfully", token: token });
                } else {
                    res.status(401).json({ status: false, error: "Incorrect password" });
                }
            } else {
                res.status(401).json({ status: false, error: "Incorrect user" });
            }
        }
    } catch (error) {
        console.error("Error en el bloque catch:", error);
        res.status(500).json({ error: "Internal server error not connection" });
    }
});




export default router;