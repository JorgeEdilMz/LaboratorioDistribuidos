import express from "express";
import cors from "cors";
import userRolesRoutes from "./routes/roles_users_routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRolesRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});
