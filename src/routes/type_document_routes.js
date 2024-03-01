import { Router } from "express";
import {orm} from "../db.js"
import * as auth from '../authToken.js';

const router = Router();

router.get('/typesDocument', async (req, res) => {
    const tipo_documentos = await orm.tipo_documentos.findMany({})
    res.json(tipo_documentos)
});

router.get('/typesDocument/:id',auth.authenticateToken,  async (req, res) => {
    const typeDocumentFound = await orm.tipo_documentos.findFirst({
        where:{
            id_tipo_documento: parseInt(req.params.id)
        }
    })
    if(!typeDocumentFound)
        return res.status(400).json({error:"Type document not found"})
    res.json(typeDocumentFound)
});

router.delete('/typesDocument/:id',auth.authenticateToken,  async (req, res) => {
    const typeDocumentDelete = await orm.tipo_documentos.delete({
        where:{
            id_tipo_documento: parseInt(req.params.id)
        }
    })
    if(!typeDocumentDelete)
        return res.status(400).json({error:"Type document not found"})
    return res.json(typeDocumentDelete)
});

router.put('/typesDocument/:id',auth.authenticateToken,  async (req, res) => {
    const typeDocumentUpdate = await orm.tipo_documentos.update({
        where:{
            id_tipo_documento: parseInt(req.params.id)
        },
        data: req.body
    })
    if(!typeDocumentUpdate)
        return res.status(400).json({error:"Type document not found"})
    return res.json(typeDocumentUpdate)
});

router.post('/typesDocument',auth.authenticateToken,  async (req, res) => {
    const newTypeDocument = await orm.tipo_documentos.create({
        data: req.body
    })
    res.json(newTypeDocument);
});


export default router;