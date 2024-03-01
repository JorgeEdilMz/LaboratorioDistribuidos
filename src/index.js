import express from "express";
import cors from "cors";
import userRoutes from "./routes/users_routers.js";
import rolesRoutes from "./routes/roles_routers_routes.js";
import typeDocumentsRoutes from "./routes/type_document_routes.js";
import userRolesRoutes from "./routes/roles_users_routes.js";

const app = express();
const PORTS = [3000, 3001, 3002]; 

const selectPort = () => {
  for (const port of PORTS) {
    if (!process.env.PORT || process.env.PORT == port) {
      return port;
    }
  }
  return PORTS[0]; 
};

const PORT = selectPort();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use('/api', typeDocumentsRoutes);
app.use('/api', userRolesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
