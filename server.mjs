import express from "express";
import { injectDecoratorServerSide } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const props = {
  env: "dev",
  params: {
    //simple: true,
    simpleHeader: true,
    simpleFooter: false, 
  },
};

function decorator(filePath) {
  return (req, res) => {
    injectDecoratorServerSide({ ...props, filePath })
      .then((html) => {
        res.send(html);
      })
      .catch((e) => {
        console.error(e);
        res.status(500).send(e);
      });
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = "";

const app = express();

const buildPath = path.join(path.resolve(__dirname, "./dist"));

app.use(basePath, express.static(buildPath, { index: false }));

app.get(`${basePath}/isAlive|${basePath}/isReady`, (req, res) => {
  res.send("OK");
});

// app.use(
//   `${process.env.VITE_API_PATH}`,
//   createProxyMiddleware({
//     target: `${process.env.VITE_API_URL}/api`,
//     changeOrigin: true,
//     pathRewrite: { [`^${process.env.VITE_API_PATH}`]: "" },
//   })
// );

app.use(
  /^(?!.*\/(internal|static)\/).*$/,
  decorator(`${buildPath}/index.html`)
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Listening on port " + port);
});