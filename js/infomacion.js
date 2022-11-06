const nave2 = document.getElementById("nave2");
const nave1 = document.getElementById("nave1");
const empezar = document.getElementById("boton");
const pantalla = document.getElementById("informacion");
const canvas = document.getElementById("miCanvas");
let elegido = true;

nave1.addEventListener("click", () => {
    nave1.classList.add("selecionado");
    nave2.classList.remove("selecionado");
    elegido = true;
    console.log("hola")
});

nave2.addEventListener("click", () => {
    nave2.classList.add("selecionado");
    nave1.classList.remove("selecionado");
    elegido = false;
    console.log("pepe")

});

empezar.addEventListener("click", () => {
    if (elegido) {
        window.location.href = "juego.html";
    } else {
        window.location.href = "juego.html?nave1=2";
    }
});
