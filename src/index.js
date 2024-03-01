import express from "express";
import cors from "cors";
import userRoutes from "./routes/users_routers.js";
import rolesRoutes from "./routes/roles_routers_routes.js";
import typeDocumentsRoutes from "./routes/type_document_routes.js";
import userRolesRoutes from "./routes/roles_users_routes.js";


const PORT = process.env.PORT || 3000; // Definir el puerto

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use('/api', typeDocumentsRoutes);
app.use('/api', userRolesRoutes);

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});
