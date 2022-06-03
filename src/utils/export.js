const toCsv = (content, name = "") => {
  const encodedUri = encodeURI(content);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("target", "_blank");
  link.setAttribute("download", `${name ? `${name}-` : ""}${new Date().toISOString()}.csv`);
  document.body.appendChild(link);

  link.click();
  link.remove();
};

export {
  toCsv
};