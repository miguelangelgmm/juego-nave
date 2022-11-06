import {
    Nave,
    ManejadorDeEventos,
    Asteroide,
    Jugador,
    Arma,
    Municion,
    Corazon,
    Enemigo,
    ArmaEnemigo,
    CorazonDorado,
} from "./clases.js";


//constantes
const JUEGO_FPS = 60;
let micanvas;
let contexto;
const ALTO = "600";
const DURACION_ESCUDO = 4000;

//inicia el juego cuando se ha pulsado el boton de empezar
window.onload = function () {
    micanvas = document.getElementById("miCanvas");
    contexto = micanvas.getContext("2d");

    let juego = new Juego();
};

/**
 * Limpia el canvas
 */
function limpiar() {
    micanvas.width = micanvas.width;
}

/**
 * Retorna true el 40% del tiempo
 * @returns true o false
 */
function aleatorio() {
    return Math.random() > 0.4;
}

/**
 * Retorna true el 20% del tiempo
 * @returns true o false
 */
function critico() {
    return Math.random() < 0.2;
}
//clase que se va a encargar de gestionar el juego
class Juego {
    constructor() {
        //objetos y listas a utilizar
        let jugador = new Jugador(contexto);
        let viper = new Nave(contexto, jugador);
        let asteroides = [new Asteroide(contexto)];
        let disparo = new Arma(contexto, viper);
        let disparos = [];
        let municiones = [];
        let corazones = [];
        let manejadornave = new ManejadorDeEventos(viper);
        let enemigos = [];
        let disparosEnemigos = [];
        let tiempoDisparoEnemigo = new Date(0);
        /**
         * Finaliza el juego, limpiando los intervalos y mostrando el resultado
         */
        function finalizarJuego() {
            clearInterval(game);
            clearInterval(obstaculos);
            clearInterval(ayuda);
            clearInterval(curar);
            clearInterval(generarEnemigo);
            alert(`
            Game over
            Puntos: ${jugador.puntos}
            Tiempo: ${jugador.getDuracion()}
            Enemigos: ${jugador.getEnemigosDerrotados()}
            `);

            document.location.reload();
            console.log("hola");
        }

        let tiempoActual = new Date();
        //para gestionar el tiempo del escudo
        let duracion = new Date(0);
        //para evitar rebotes de la pulsación
        let rebote = new Date(0);
        //función del juego
        this.correr = function () {
            limpiar();
            //dibujamos los elementos que siempre van a estar en la pantalla
            viper.dibujar();
            jugador.dibujar();
            jugador.setDuracion(tiempoActual.getTime());

            //disparamos una vez cada 100 ms
            if (viper.disparar && rebote.getTime() < tiempoActual.getTime()) {
                //si dispone de munición
                if (jugador.getMunicion()) {
                    disparos.push(new Arma(contexto, viper));
                    viper.disparar = false;
                    rebote = new Date(tiempoActual.getTime() + 100);
                    jugador.municion--;
                }
            }

            //si cogemos un corazón con la nave nos cura
            corazones.forEach((corazon, index) => {
                //dibujamos
                corazon.animacion();
                corazon.dibujar();
                //si el corazón se sale del canvas lo eliminamos
                corazon.getY() >= ALTO && corazones.splice(index, 1);
                //compruega si hemos cogido el corazón
                if (
                    corazon.getY() >= viper.getY() - 40 &&
                    corazon.getY() <= viper.getY() + 60 &&
                    corazon.getX() >= viper.getX() - 40 &&
                    corazon.getX() <= viper.getX() + 40
                ) {
                    //si el corazon es dodrado pondra las vidas a 4 si no suma 1
                    corazon instanceof CorazonDorado
                        ? jugador.SetDorado()
                        : jugador.incrementarVidas();
                    //incrementamos la vida

                    //eliminamos el corazón
                    corazones.splice(index, 1);
                }
            });
            //si cogemos la munición la incrementamos
            municiones.forEach((municion, index) => {
                //dibujamos
                municion.animacion();
                municion.dibujar();
                //comprobamos si hemos cogido la munición
                if (
                    municion.getY() >= viper.getY() - 40 &&
                    municion.getY() <= viper.getY() + 60 &&
                    municion.getX() >= viper.getX() - 40 &&
                    municion.getX() <= viper.getX() + 40
                ) {
                    //incrementamos la munición
                    jugador.municion += municion.getMunicion();
                    //eliminamos la munición
                    municiones.splice(index, 1);
                }
                //si la munición se sale del canvas lo eliminamos
                municion.getY() >= ALTO && municiones.splice(index, 1);
            });

            //disparamos
            disparos.forEach((disparo, indexDisparo) => {
                //si el disparo se sale del canvas lo eliminamos
                disparo.getY() <= 0 && disparos.splice(indexDisparo, 1);
                //dibujamos
                disparo.animacion();
                disparo.dibujar();
                //comprobamos si el disparo ha colisionado con un asteroide
                asteroides.forEach((asteroide, index) => {
                    if (
                        asteroide.getY() >= disparo.getY() &&
                        asteroide.getY() <= viper.getY() &&
                        asteroide.getX() - 60 < disparo.getX() &&
                        asteroide.getX() + 60 >= disparo.getX()
                    ) {
                        //eliminamos el disparo
                        disparos.splice(indexDisparo, 1);
                        //decrementamos vida
                        asteroide.decrementarVidas();
                        //el jugador puede dar un disparo crítico y podría llegar a eliminar el asteroide
                        critico() && asteroide.decrementarVidas();
                        critico() && asteroide.decrementarVidas();
                        //si el asteroide no tiene vida lo eliminamos
                        if (asteroide.vidas <= 0) {
                            //podría generar munición la eliminación del asteroide
                            if (aleatorio()) {
                                municiones.push(
                                    new Municion(
                                        contexto,
                                        asteroide.getX(),
                                        asteroide.getY()
                                    )
                                );
                            }
                            //incrementamos los puntos del jugador y eliminamos el asteroide
                            jugador.incrementarPuntos();
                            asteroides.splice(index, 1);
                        }
                    }
                });
            });

            //comprobamos si hemos colisionado con un asteroide
            asteroides.forEach((asteroide, index) => {
                //dibujamos
                asteroide.dibujar();
                asteroide.animacion();

                //si el asteroide se sale de la pantalla lo eliminamos del array
                asteroide.getY() >= ALTO && asteroides.splice(index, 1);
                //si hemos colisionado y no disponemos escudo
                if (
                    asteroide.getY() >= viper.getY() - 40 &&
                    asteroide.getY() <= viper.getY() + 60 &&
                    asteroide.getX() >= viper.getX() - 40 &&
                    asteroide.getX() <= viper.getX() + 40 &&
                    !jugador.escudo
                ) {
                    //perdemos una vida
                    jugador.decrementarVidas();
                    //si la vida es = o inferorior 0 finalizamos el juego
                    if (jugador.vidas <= 0) {
                        finalizarJuego();
                    }
                    //activamos el escudo y le damos la duración
                    jugador.escudo = true;
                    viper.centrar();
                    duracion = new Date(
                        tiempoActual.getTime() + DURACION_ESCUDO
                    );
                }
            });

            enemigos.forEach((enemigo, index) => {
                //dibujamos
                enemigo.dibujar();
                //   asteroide.animacion();

                if (tiempoDisparoEnemigo.getTime() < tiempoActual.getTime()) {
                    disparosEnemigos.push(
                        new ArmaEnemigo(contexto, enemigos[0])
                    );
                    //realiza un disparo cada 1 s
                    tiempoDisparoEnemigo = new Date(
                        tiempoActual.getTime() + 1000
                    );
                }
                //comprobamos si el enemigo ha colisionado con un disparo
                disparos.forEach((disparo, indexDisparo) => {
                    //comprobamos si existe colisión
                    if (
                        enemigo.getY() + 40 >= disparo.getY() &&
                        disparo.getX() - enemigo.getX() < 80 &&
                        disparo.getX() - enemigo.getX() > 0
                    ) {
                        //reducimos vida
                        enemigo.reducirVida();
                        //eliminamos dis    paro
                        disparos.splice(indexDisparo, 1);
                        //incrementamos su velocidad
                        enemigo.incrementarIncremento(2);
                    }
                });
                //si el enmigo pierde las vidas
                if (enemigo.getVida() <= 0) {
                    corazones.push(new CorazonDorado(enemigo.getX(), contexto));
                    enemigos.splice(index, 1);
                    jugador.incEnemigosDerrotados();
                }
            });
            disparosEnemigos.forEach((disparoEnemigo, indexDisparo) => {
                disparoEnemigo.dibujar();
                disparoEnemigo.animacion();

                disparo.getY() >= ALTO &&
                    disparosEnemigos.splice(indexDisparo, 1);
                if (
                    disparoEnemigo.getY() >= viper.getY() - 40 &&
                    disparoEnemigo.getY() <= viper.getY() + 40 &&
                    disparoEnemigo.getX() >= viper.getX() - 40 &&
                    disparoEnemigo.getX() <= viper.getX() + 40 &&
                    !jugador.escudo
                ) {
                    //perdemos una vida
                    jugador.decrementarVidas();
                    //si la vida es = o inferorior 0 finalizamos el juego
                    if (jugador.vidas <= 0) {
                        finalizarJuego();
                    }
                    //activamos el escudo y le damos la duración
                    jugador.escudo = true;
                    viper.centrar();
                    duracion = new Date(
                        tiempoActual.getTime() + DURACION_ESCUDO
                    );
                }
            });

            //actualizamos el tiempo actual
            tiempoActual = new Date();

            //comprobamos si eliminar el escudo
            if (tiempoActual.getTime() > duracion.getTime()) {
                jugador.escudo = false;
            }
            //rango para eliminar el escudo si no te mueves
            if (
                duracion.getTime() >= tiempoActual.getTime() - 35 &&
                duracion.getTime() <= tiempoActual.getTime()
            ) {
                viper.centrar();
            }
        };
        //activamos el intervalo de juego en un intervalo
        let game = setInterval(this.correr, 1000 / JUEGO_FPS);
        //generamos los asteroides en un intervalo
        let /* A setInterval that is pushing a new Asteroid into the asteroides array every 500ms. */
            obstaculos = setInterval(() => {
                asteroides.push(new Asteroide(contexto));
            }, 500);
        //genereamos la munición en un intervalo
        let ayuda = setInterval(() => {
            municiones.push(
                new Municion(
                    contexto,
                    Math.trunc(Math.random() * 880) + 60,
                    -50
                )
            );
        }, 10000);
        //generamos las curas en un intervalo
        let curar = setInterval(
            () => corazones.push(new Corazon(contexto)),
            20000
        );

        //generamos enemigo en un intervalo
        let generarEnemigo = setInterval(function () {
            if (!enemigos.length) {
                let enemigo = new Enemigo(contexto);
                enemigos.push(enemigo);
            }
        }, 15000);
    }
}
