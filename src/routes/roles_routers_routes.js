import { Router } from "express";
import { orm } from "../db.js"
import * as auth from '../authToken.js';

const router = Router();

import redis from 'redis';

const cachePass = "3SWLQcIYw64HPm3z3o6ZuoX8rMpeZ1qF3AzCaJYrIlk=";
const cacheHost = "rolesCache.redis.cache.windows.net";
var cacheConnection = ""
try{
    cacheConnection = redis.createClient({
        url: `rediss://${cacheHost}:6380`,
        password: cachePass
    });
    
    await cacheConnection.connect();
    
    console.log("Cache response : " + await cacheConnection.ping());
}catch (error){
    console.error("Cache response : Not Response - Please Check connections");
}





const redisSet = async ({ body }) => {
    // Almacenar el cuerpo de la solicitud (que es un array de objetos JSON) en Redis 2 minutos de vida
    await cacheConnection.setEx('roles', 120, JSON.stringify(body));
}


router.get('/roles', auth.authenticateToken, async (req, res) => {
    try {
        var cachedRoles = ""
        // Intenta obtener los roles de Redis
        if(cacheConnection!=""){
            cachedRoles = await cacheConnection.get('roles');
        }
        

        let roles;
        if (cachedRoles) {
            // Si los roles están en Redis, usa esos
            roles = JSON.parse(cachedRoles);
        } else {
            // Si no, obtén los roles de la base de datos y almacénalos en Redis
            roles = await orm.roles.findMany();
            if(cacheConnection!=""){
                redisSet({ body: roles });
            }
        }

        if (roles.length != 0) {
            res.json(roles);
        } else {
            res.status(204).json({ info: "Not content" });
        }
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.patch('/roles/:id/', auth.authenticateToken, async (req, res) => {
    const { nombre_rol, estado_rol, descripcion_rol } = req.body;
    const roleId = parseInt(req.params.id);

    try {
        const updatedRole = await orm.roles.update({
            where: { id_rol: roleId },
            data: {
                nombre_rol: nombre_rol,
                estado_rol: estado_rol,
                descripcion_rol: descripcion_rol
            }
        });

        if (!updatedRole) {
            return res.status(404).json({ error: "Role not found" });
        }

        return res.status(200).json({ message: "Modified successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



router.get('/roles/:id', auth.authenticateToken, async (req, res) => {
    try {
        const foundRol = await orm.roles.findFirst({
            where: {
                id_rol: parseInt(req.params.id)
            }
        });

        if (!foundRol) {
            return res.status(404).json({ error: "Rol not found" });
        }

        res.json(foundRol);
    } catch (error) {
        console.error("Error fetching Rol:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/roles/:id', auth.authenticateToken, async (req, res) => {
    try {

        // Elimina el rol por su el ID_ROL proporcionado en la ruta
        const deleteResult = await orm.roles.delete({
            where: {
                id_rol: parseInt(req.params.id)
            }
        });

        if (deleteResult) {
            res.json({ info: "Rol deleted successfully" });
        } else {
            res.status(404).json({ error: "Rol not found" });
        }
    } catch (error) {
        console.error("Error deleting Rol:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



router.put('/roles/:id', auth.authenticateToken, async (req, res) => {
    try {
        const RolUpdate = await orm.roles.update({
            where: {
                id_rol: parseInt(req.params.id)
            },
            data: req.body
        });

        if (RolUpdate === null) {
            return res.status(404).json({ error: "Rol not found" });
        }

        return res.json({ info: "Rol updated successfully" });
    } catch (error) {
        console.error("Error updating Rol:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/roles', auth.authenticateToken, async (req, res) => {
    try {

        const newConnection = await orm.roles.create({
            data: req.body
        });

        res.status(200).json({ info: "Rol created!" });
    } catch (error) {
        console.error("Error creating Rol:", error);
        return res.status(400).json({ error: "Rol could not be created." });
    }
});
export default router;