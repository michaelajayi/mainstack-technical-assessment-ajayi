"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const db_1 = __importDefault(require("./config/db"));
const errors_1 = require("./middlewares/errors");
const routes_1 = require("./routes");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const port = config_1.default.port.app || 8001;
// Connect to MongoDB
try {
    (0, db_1.default)();
}
catch (err) {
    logger_1.default.error(err);
}
// Middlewares
app.use((0, cors_1.default)(corsOptions_1.default));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
// Basic route
app.get("/", (req, res) => {
    res.send("Hello from Express server with TypeScript!");
});
``;
// Define routes
app.use("/api/v1", routes_1.v1Router);
// Serve static files from the 'public' folder
app.use("/public", express_1.default.static("public"));
// Error handling
app.use("*", errors_1.notFoundHandler);
app.use(errors_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
