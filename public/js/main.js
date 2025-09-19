// Expresión regular: solo permite dígitos (0-9), +, -, *, / y paréntesis
const validacion = /^[0-9+\-*/()]+$/;

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
    lineas.forEach(l => l.remove());  // Borra cada línea con .remove()
    lineas = [];                      // Vacía el arreglo (reinicia)
}
// ====== PARSER (CONSTRUYE EL ÁRBOL) ======
// Convierte un string como "(2+2)*(55+8)" en un objeto árbol
// { op:'*', left:{op:'+', left:{value:'2'}, right:{value:'2'}}, right:{op:'+', ...} }
function parse(exp) {
  exp = exp.replace(/\s+/g, ""); // Quita espacios en blanco
  let pos = 0;                   // Posición actual al recorrer la cadena

  // --- Maneja + y - (menor precedencia)
  function parseExpr() {
    let node = parseTerm();                    // Lee primer término
    while (exp[pos] === "+" || exp[pos] === "-") { // Mientras vea + o -
      let op = exp[pos++];                     // Guarda el operador y avanza
      node = { op, left: node, right: parseTerm() }; // Crea nodo operador
    }
    return node;                               // Devuelve el subárbol
  }
  // --- Maneja * y / (mayor precedencia que + y -)
  function parseTerm() {
    let node = parseFactor();                  // Lee primer factor
    while (exp[pos] === "*" || exp[pos] === "/") { // Mientras vea * o /
      let op = exp[pos++];                     // Guarda operador y avanza
      node = { op, left: node, right: parseFactor() }; // Crea nodo operador
    }
    return node;                               // Devuelve subárbol
  }
  // --- Maneja números o expresiones entre paréntesis
  function parseFactor() {
    if (exp[pos] === "(") {       // Si encuentra '('
      pos++;                      // Avanza (ignora '(')
      let node = parseExpr();     // Procesa lo que hay dentro
      pos++;                      // Avanza (ignora ')')
      return node;                // Devuelve el nodo del interior
    }
    // Si no hay paréntesis → es un número
    let start = pos;                          // Marca inicio del número
    while (/\d/.test(exp[pos])) pos++;        // Avanza mientras haya dígitos
    return { value: exp.slice(start, pos) };  // Devuelve nodo hoja con número
  }
  return parseExpr(); // Empieza desde el nivel de expresión
}
// ====== DIBUJO DEL ÁRBOL ======
let contador = 0; // Contador para generar IDs únicos a cada nodo

// Crea un nodo HTML (un <div>) y lo mete al contenedor
function crearNodoHTML(contenido, esOperador) {
  const id = "n" + (contador++);                 // Genera ID único
  const div = document.createElement("div");     // Crea un <div>
  div.id = id;                                   // Le asigna el ID
  // Si es operador (+ - * /) le agrega la clase "operador" además de "nodo"
  div.className = "nodo" + (esOperador ? " operador" : "");
  div.textContent = contenido;                   // Texto dentro del círculo
  arbol.appendChild(div);                        // Inserta el nodo al contenedor
  return div;                                    // Devuelve el div creado
}
// Función recursiva: dibuja el nodo actual, sus hijos y las líneas que los conectan
function dibujarNodo(node, x = 400, y = 40, nivel = 1) {
  if (!node) return null; // Si no hay nodo → no hace nada

  const esOp = !!node.op;                // Detecta si es operador y se guarda en esOp
// ! es un + entonces manda un false
//! false --> se vuelve true

  const contenido = node.op || node.value; // Muestra operador o valor numérico

  const nodoHTML = crearNodoHTML(contenido, esOp); // Crea nodo HTML
  nodoHTML.style.left = (x - 20) + "px"; // Ajusta posición horizontal
  nodoHTML.style.top = (y - 20) + "px";  // Ajusta posición vertical

  const offset = 150 / nivel; // Separación horizontal entre nodos hijos

  // --- Dibujar hijo izquierdo (si existe) ---
  let leftHTML = null;
  if (node.left) {
    leftHTML = dibujarNodo(node.left, x - offset, y + 100, nivel + 1);
  }

  // --- Dibujar hijo derecho (si existe) ---
  let rightHTML = null;
  if (node.right) {
    rightHTML = dibujarNodo(node.right, x + offset, y + 100, nivel + 1);
  }

  // Conecta nodo padre con hijo izquierdo
  if (leftHTML) {
    const l = new LeaderLine(nodoHTML, leftHTML, estilos);
    lineas.push(l); // Guarda línea en arreglo para poder borrarla después
  }
  // Conecta nodo padre con hijo derecho
  if (rightHTML) {
    const l = new LeaderLine(nodoHTML, rightHTML, estilos);
    lineas.push(l);
  }

  return nodoHTML; // Devuelve el div del nodo actual
}

// funcion del botón "Generar"
document.getElementById("btn_generar").addEventListener("click", () => {
  const exp = document.getElementById("expresion").value; // Lee la expresión del input

  // Valida que solo haya caracteres permitidos
  if (!validacion.test(exp)) {
    alert("Expresión no válida"); 
    return;                       // Detiene ejecución
  }

  arbol.innerHTML = ""; // Borra los nodos dibujados anteriormente
  limpiarLineas();      // Borra las líneas anteriores
  contador = 0;         // Reinicia el contador de IDs

  const tree = parse(exp); // Convierte la expresión en un árbol (parser)
  dibujarNodo(tree);       // Dibuja el árbol en pantalla
});
