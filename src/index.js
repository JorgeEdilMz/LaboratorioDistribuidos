import express from "express";
import cors from "cors";
import rolesRoutes from "./routes/roles_routers_routes.js";
import userRoutes from "./routes/users_routers.js";

const PORT = process.env.PORT || 3000; // Definir el puerto

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', rolesRoutes);
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});
