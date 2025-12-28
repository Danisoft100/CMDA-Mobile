import errorMiddleware from "./errorMiddleware";
import api from "../api";

const rootMiddleWare = [api.middleware, errorMiddleware];

export default rootMiddleWare;
