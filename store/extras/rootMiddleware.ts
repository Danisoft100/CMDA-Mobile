import errorMiddleware from "./errorMiddleware";
import api from "../api/api";

const rootMiddleWare = [api.middleware, errorMiddleware];

export default rootMiddleWare;
