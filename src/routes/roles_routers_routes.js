import { Router } from "express";
import {orm} from "../db.js"
import * as auth from '../authToken.js';

const router = Router();
    

router.get('/roles', auth.authenticateToken, async (req, res) => {
    try {
        // Intenta obtener los roles de la base de datos
        const roles = await orm.roles.findMany();

        if (roles.length !== 0) {
            res.json(roles);
        } else {
            res.status(204).json({ info: "No content" });
        }
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});





router.get('/roles/:id',auth.authenticateToken, async (req, res) => {
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

router.delete('/roles/:id',auth.authenticateToken,async (req, res) => {
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





router.put('/roles/:id',auth.authenticateToken, async (req, res) => {
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

router.post('/roles',auth.authenticateToken, async (req, res) => {
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