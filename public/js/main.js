// Expresión regular: permite dígitos, letras, +, -, *, / y paréntesis
const validacion = /^[0-9a-zA-Z+\-*/()]+$/;

// Referencia al contenedor HTML donde se dibujará el árbol
const arbol = document.getElementById("contenido_arbol");

// Estilos de las líneas que dibuja la librería LeaderLine
const estilos = {
  color: '#080808ff',
  outline: false,
  endPlugOutline: false,
  endPlugSize: 1,
  startPlug: 'behind',
  endPlug: 'behind'
};

// Guardará todas las líneas dibujadas para poder borrarlas después
let lineas = [];

// Elimina todas las líneas actuales
function limpiarLineas() {
  lineas.forEach(l => l.remove());
  lineas = [];
}

// ====== PARSER (CONSTRUYE EL ÁRBOL) ======
function parse(exp) {
  exp = exp.replace(/\s+/g, ""); // Quita espacios en blanco
  let pos = 0;

  function parseExpr() {
    let node = parseTerm();
    while (exp[pos] === "+" || exp[pos] === "-") {
      let op = exp[pos++];
      node = { op, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseTerm() {
    let node = parseFactor();
    while (exp[pos] === "*" || exp[pos] === "/") {
      let op = exp[pos++];
      node = { op, left: node, right: parseFactor() };
    }
    return node;
  }

  function parseFactor() {
    if (exp[pos] === "(") {
      pos++;
      const node = parseExpr();
      if (exp[pos] !== ")") throw new Error("Falta ')'");
      pos++;
      return node;
    }

    const start = pos;
    while (pos < exp.length && /[0-9a-zA-Z]/.test(exp[pos])) pos++;

    if (start === pos) {
      throw new Error(`Caracter inválido '${exp[pos]}' en posición ${pos}`);
    }

    return { value: exp.slice(start, pos) };
  }

  return parseExpr();
}

// ====== DIBUJO DEL ÁRBOL ======
let contador = 0; // Contador para IDs únicos
let arbolGenerado = null; // Guardará el último árbol generado

function crearNodoHTML(contenido, esOperador) {
  const id = "n" + (contador++);
  const div = document.createElement("div");
  div.id = id;
  div.className = "nodo" + (esOperador ? " operador" : "");
  div.textContent = contenido;
  arbol.appendChild(div);
  return div;
}

function dibujarNodo(node, x = 400, y = 40, nivel = 1) {
  if (!node) return null;

  const esOp = !!node.op;
  const contenido = node.op || node.value;

  const nodoHTML = crearNodoHTML(contenido, esOp);
  nodoHTML.style.left = (x - 20) + "px";
  nodoHTML.style.top = (y - 20) + "px";

  const offset = 150 / nivel;

  let leftHTML = null;
  if (node.left) leftHTML = dibujarNodo(node.left, x - offset, y + 100, nivel + 1);

  let rightHTML = null;
  if (node.right) rightHTML = dibujarNodo(node.right, x + offset, y + 100, nivel + 1);

  if (leftHTML) lineas.push(new LeaderLine(nodoHTML, leftHTML, estilos));
  if (rightHTML) lineas.push(new LeaderLine(nodoHTML, rightHTML, estilos));

  return nodoHTML;
}

// ====== RECORRIDOS SEGÚN CONVENCIÓN DE CLASE ======
function recorrerPreorden(node, resultado) {
  if (!node) return;
  // Según tu clase: Nodo izquierdo + Nodo + Nodo derecho
  if (node.left) recorrerPreorden(node.left, resultado);
  resultado.push(node.op || node.value);
  if (node.right) recorrerPreorden(node.right, resultado);
}

function recorrerInorden(node, resultado) {
  if (!node) return;
  // Según tu clase: Nodo izquierdo + Nodo derecho + Nodo
  if (node.left) recorrerInorden(node.left, resultado);
  if (node.right) recorrerInorden(node.right, resultado);
  resultado.push(node.op || node.value);
}

function recorrerPostorden(node, resultado) {
  if (!node) return;
  // Según tu clase: Nodo + Nodo izquierdo + Nodo derecho
  resultado.push(node.op || node.value);
  if (node.left) recorrerPostorden(node.left, resultado);
  if (node.right) recorrerPostorden(node.right, resultado);
}

// ====== BOTONES ======

// Generar árbol
document.getElementById("btn_generar").addEventListener("click", () => {
  const exp = document.getElementById("expresion").value;

  if (!validacion.test(exp)) {
    alert("Expresión no válida");
    return;
  }

  arbol.innerHTML = "";
  limpiarLineas();
  contador = 0;

  try {
    arbolGenerado = parse(exp); // Guardamos árbol generado
    dibujarNodo(arbolGenerado);
  } catch (e) {
    alert("Error al generar árbol: " + e.message);
  }
});

// Mostrar recorrido
document.getElementById("btn_mostrar_recorrido").addEventListener("click", () => {
  if (!arbolGenerado) {
    alert("Primero genera un árbol con una expresión");
    return;
  }

  const tipo = document.getElementById("orden").value;
  let resultado = [];

  if (tipo === "preorden") recorrerPreorden(arbolGenerado, resultado);
  else if (tipo === "postorden") recorrerPostorden(arbolGenerado, resultado);
  else recorrerInorden(arbolGenerado, resultado);

  document.getElementById("resultado").innerText =
    `Recorrido (${tipo}): ${resultado.join(" ")}`;
});
