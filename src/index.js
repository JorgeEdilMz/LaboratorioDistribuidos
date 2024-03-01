import express from "express";
import cors from "cors";
import userRoutes from "./routes/users_routers.js";
import rolesRoutes from "./routes/roles_routers_routes.js";
import typeDocumentsRoutes from "./routes/type_document_routes.js";
import userRolesRoutes from "./routes/roles_users_routes.js";

const app = express();
const PORT_START = 3000;
let currentPort = PORT_START;

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use('/api', typeDocumentsRoutes);
app.use('/api', userRolesRoutes);

function startServer(port) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

while (currentPort < PORT_START + 3) {
  try {
    startServer(currentPort);
    break;
  } catch (error) {
    console.log(`Port ${currentPort} already in use, trying next port...`);
    currentPort++;
  }
}

if (currentPort === PORT_START + 3) {
  console.error('All ports in use.');
}
