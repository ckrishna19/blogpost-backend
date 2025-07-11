import fs from "fs";

const collection = JSON.parse(fs.readFileSync("api.json", "utf-8"));

const extractEndpoints = (items, basePath = "") => {
  for (const item of items) {
    if (item.item) {
      // Folder – go deeper
      const folderName = basePath ? `${basePath}/${item.name}` : item.name;
      apis = apis.concat(extractEndpoints(item.item, folderName));
    } else {
      const method = item.request.method;
      const rawUrl = item.request.url.raw;
      const name = item.name;
      apis.push({
        group: basePath,
        name,
        method,
        url: rawUrl,
      });
    }
  }
  return apis;
};
const endpoints = extractEndpoints(collection.item);

console.log("🧾 Extracted API Endpoints:");
endpoints.forEach((api, i) => {
  console.log(
    `${i + 1}. [${api.method}] ${api.url} (${api.group} > ${api.name})`
  );
});
