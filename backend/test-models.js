fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyATg15_gEMcB-tdepRZIxWPCBblX6X9HAE").then(r=>r.json()).then(data => {
  if (data.models) {
    console.log(data.models.map(m => m.name).join('\n'));
  } else {
    console.log("No models returned:", data);
  }
}).catch(console.error);
