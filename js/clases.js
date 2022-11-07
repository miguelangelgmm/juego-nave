const DIR_IMG = "img/";
const LARGO = "1000";
const ALTO = "600";
const POSX_INICIAL = Math.round(LARGO / 2) - 15;
const POSY_INICIAL = ALTO - 65;

//imagen nave elegida
const imgNave = window.location.href.includes("azul") ? "Nave2" : "Nave1";

/**
 * Maneja los eventos relacionados con la nave
 *
 * a (97) --> mover a la izquierda
 * d (100) --> mover a la dercha
 * s (115) --> mover abajo
 * w (119) --> mover Arriba
 * espacio (32) --> disparar
 * al soltar las teclas de a o d coloca la nava en el centro
 */
export class ManejadorDeEventos {
    constructor(nave) {
        this.nave = nave;
        this.tecla = function (e) {
            // se obtiene el evento
            let evento = e || window.event;
            switch (evento.keyCode) {
                case 97:
                    nave.moverIzquierda();
                    break;

                case 100:
                    nave.moverDerecha();
                    break;

                case 115:
                    nave.moverAbajo();
                    break;

                case 119:
                    nave.moverArriba();
                    break;
                case 32:
                    nave.disparar = true;
            }
            return 0;
        };

        /* Cuando soltamos la tecla d o a colocamos la nave */
        this.teclaUp = function (e) {
            let evento = e || window.event;

            if (evento.keyCode == 65 || evento.keyCode == 68) {
                nave.centrar();
            }

            return 0;
        };
        document.body.onkeypress = this.tecla;
        document.body.onkeyup = this.teclaUp;
    }
}
/**
 * Nave del juego
 */
export class Nave {
    constructor(contexto, jugador) {
        // posiciones
        this.posx = new Number(POSX_INICIAL);
        this.posy = new Number(POSY_INICIAL);
        //si puede disparar
        this.disparar = false;
        //imagen
        this.figura = new Image();
        this.figura.src = DIR_IMG + imgNave + "/viper.png";
        //dibujo
        this.dibujar = function () {
            let figura = this.getFigura();
            let x = this.getX();
            let y = this.getY();

            if (isNaN(x) || isNaN(y)) {
                x = Math.rint(LARGO / 2);
                y = ALTO + 15;
            }

            contexto.drawImage(figura, x, y, 60, 60);
        };
        //funciones
        this.getEscudo = function () {
            jugador.escudo &&
                (this.figura.src = DIR_IMG + imgNave + "/viperEscudo.png");
        };

        this.getX = function () {
            return this.posx;
        };

        this.getY = function () {
            return this.posy;
        };
        this.getFigura = function () {
            return this.figura;
        };
        //solo se puede desplazar si se encuentra en el canvas
        this.moverArriba = function () {
            this.posy > 0 ? (this.posy -= 15) : (this.posy -= 0);
            //si el jugador dispone de escudo al mover se pondra la siguiente imagen
            jugador.escudo &&
                (this.figura.src = DIR_IMG + imgNave + "/viperEscudo.png");
        };

        this.moverAbajo = function () {
            this.posy < ALTO - 60 ? (this.posy += 15) : (this.posy += 0);
            //si el jugador dispone de escudo al mover se pondra la siguiente imagen
            jugador.escudo &&
                (this.figura.src = DIR_IMG + imgNave + "/viperEscudo.png");
        };
        this.moverIzquierda = function () {
            this.posx > 0 ? (this.posx -= 15) : (this.posx -= 0);
            jugador.escudo
                ? (this.figura.src =
                        DIR_IMG + imgNave + "/viperIzquierdaEscudo.png")
                : (this.figura.src = DIR_IMG + imgNave + "/viperIzquierda.png");
        };

        this.moverDerecha = function () {
            this.posx < LARGO - 60 ? (this.posx += 15) : (this.posx += 0);
            jugador.escudo
                ? (this.figura.src =
                        DIR_IMG + imgNave + "/viperDerechaEscudo.png")
                : (this.figura.src = DIR_IMG + imgNave + "/viperDerecha.png");
        };
        this.centrar = function () {
            jugador.escudo
                ? (this.figura.src = DIR_IMG + imgNave + "/viperEscudo.png")
                : (this.figura.src = DIR_IMG + imgNave + "/viper.png");
        };
    }
}
/**
 * Asteroide
 */
export class Asteroide {
    constructor(contexto) {
        //Generamos la posición aleatoria en x y en -50y
        this.posx = new Number(Math.trunc(Math.random() * 880) + 60);
        this.posy = new Number(-50);
        //Generamos un incremento aleatorio
        this.incremento = Math.trunc(Math.random() * 6) + 1;
        //establecemos las vidas
        this.vidas = 3;
        //imagen
        this.figura = new Image();
        this.figura.src = DIR_IMG + "asteroide.png";
        //dibujo, tenemos uno en funciónd el daño recibido
        this.dibujar = function () {
            let figura = this.getFigura();
            this.vidas == 2 &&
                (this.figura.src = DIR_IMG + "asteroideRoto1.png");
            this.vidas == 1 &&
                (this.figura.src = DIR_IMG + "asteroideRoto2.png");

            let x = this.getX();
            let y = this.getY();

            if (isNaN(x) || isNaN(y)) {
                x = Math.rint(LARGO / 2);
                y = ALTO + 15;
            }
            contexto.drawImage(figura, x, y, 60, 60);
        };

        this.getIncremento = function () {
            return this.incremento;
        };

        this.getFigura = function () {
            return this.figura;
        };
        this.getX = function () {
            return this.posx;
        };

        this.getY = function () {
            return this.posy;
        };
        //animación
        this.animacion = function () {
            this.posy += this.getIncremento();
        };
        //decremento de vidas
        this.decrementarVidas = function () {
            this.vidas--;
        };
    }
}

const VIDAS_INICIALES = 3;
const MUNICION_INICIAL = 15;
/**
 * Jugador del juego
 */
export class Jugador {
    constructor(contexto) {
        this.vidas = VIDAS_INICIALES;
        //cada asteroide eliminado se sumara un punto
        this.puntos = 0;
        //marca el momento en el que iniciamos el juego
        this.inicio = new Date().getTime();
        //lleva el tiempo de juego
        this.duracion = new Date().getTime();
        //contador de enemigos derrotados
        this.enemigosDerrotados = 0;
        //munición del jugador
        this.municion = MUNICION_INICIAL;
        //si el jugador ha recibido daño se pondra a true, activado un escudo que evita que reciba daño
        this.escudo = false;
        //imagen
        this.figuraVidas = new Image();
        this.figuraVidas.src = DIR_IMG + "vidas3.png";

        //dibujamos los elementos en la esquina superior
        this.dibujar = function () {
            this.setFiguraVidas();
            contexto.drawImage(this.figuraVidas, 10, 10, 120, 40);

            contexto.font = "italic 20px Arial";
            contexto.fillStyle = "RGBA(255, 255, 252)";
            contexto.fillText(`Tiempo: ${this.duracion}`, 20, 70);
            contexto.fillText(`Munición: ${this.municion}`, 20, 100);
            contexto.fillText(`Puntos: ${this.puntos}`, 20, 130);
            contexto.fillText(`Enemigos: ${this.enemigosDerrotados}`, 20, 160);
        };

        this.setFiguraVidas = function () {
            switch (this.vidas) {
                case 4:
                    this.figuraVidas.src = DIR_IMG + "vidas4.png";
                    break;
                case 3:
                    this.figuraVidas.src = DIR_IMG + "vidas3.png";
                    break;
                case 2:
                    this.figuraVidas.src = DIR_IMG + "vidas2.png";
                    break;
                case 1:
                    this.figuraVidas.src = DIR_IMG + "vidas1.png";
                    break;
            }
        };

        this.getEnemigosDerrotados = function () {
            return this.enemigosDerrotados;
        };
        this.incEnemigosDerrotados = function () {
            this.enemigosDerrotados++;
        };
        this.getMunicion = function () {
            return this.municion;
        };
        this.decrementarVidas = function () {
            this.escudo || this.vidas--;
        };
        this.incrementarVidas = function () {
            this.vidas < 3 && this.vidas++;
        };
        this.incrementarPuntos = function () {
            this.puntos++;
        };
        //la duración se mostrara en segundos ya que el tiempo funciona en ms
        this.setDuracion = function (valor) {
            this.duracion = Math.trunc((valor - this.inicio) / 1000);
        };
        this.getDuracion = function () {
            return this.duracion;
        };
        this.SetDorado = function () {
            this.vidas = 4;
        };
    }
}

//clase que gestina la arma de la nave
export class Arma {
    constructor(contexto, Nave) {
        //indica el frame de la imagen Disponemos de 8 frames de 1 a 8
        this.frame = 1;
        //imagen
        this.disparo = new Image();
        this.disparo.src = DIR_IMG + `/Disparo/disparoSimple${this.frame}.png`;
        //las posiciones del disparo son las de la nave pero un pelin más bajo
        this.posX = Nave.getX();
        this.posY = Nave.getY() - 20;

        this.dibujar = function () {
            this.frame >= 8 ? (this.frame = 1) : this.frame++;
            this.disparo.src =
                DIR_IMG + `/Disparo/disparoSimple${this.frame}.png`;
            contexto.drawImage(this.disparo, this.posX, this.posY, 60, 20);
        };

        this.animacion = function () {
            this.posY -= 10;
        };
        this.getX = function () {
            return this.posX;
        };
        this.getY = function () {
            return this.posY;
        };

        this.tipo = function () {
            return this.tipo;
        };
    }
}

//Clase que permite obtener muncición
export class Municion {
    constructor(contexto, posicion1, posicion2) {
        // Valor de carga entre 4 y 8
        this.valor = Math.trunc(Math.random() * 5) + 4;
        //imagen
        this.figura = new Image();
        this.figura.src = DIR_IMG + "municion.png";
        //posiciones
        this.posX = posicion1;
        this.posY = posicion2 - 20;
        //dibujo
        this.dibujar = function () {
            let x = this.getX();
            let y = this.getY();
            this.animacion();
            contexto.drawImage(this.figura, x, y, 60, 60);
        };

        this.getX = function () {
            return this.posX;
        };
        this.getY = function () {
            return this.posY;
        };
        this.animacion = function () {
            this.posY += 2;
        };
        this.getMunicion = function () {
            return this.valor;
        };
    }
}
//permite recuperar vida si nuestra vida es inferior a 3
export class Corazon {
    constructor(contexto) {
        //posicion aleatoria
        this.posx = new Number(Math.trunc(Math.random() * 880) + 60);
        this.posy = new Number(-50);
        //incremento
        this.incremento = 2;
        //imagen
        this.figura = new Image();
        this.figura.src = DIR_IMG + "Corazon/corazon1.png";
        //indica el frame de la imagen Disponemos de 10 frames de 1 a 10
        this.frame = 10;
        //dibujo
        this.dibujar = function () {
            let x = this.getX();
            let y = this.getY();
            if (isNaN(x) || isNaN(y)) {
                x = Math.rint(LARGO / 2);
                y = ALTO + 15;
            }
            this.frame > 100 ? (this.frame = 10) : this.frame++;
            this.figura.src =
                DIR_IMG + `Corazon/corazon${Math.trunc(this.frame / 10)}.png`;

            contexto.drawImage(this.figura, x, y, 60, 60);
        };

        this.getIncremento = function () {
            return this.incremento;
        };

        this.getFigura = function () {
            return this.figura;
        };
        this.getX = function () {
            return this.posx;
        };

        this.getY = function () {
            return this.posy;
        };

        this.animacion = function () {
            this.posy += this.getIncremento();
        };
    }
}

export class Enemigo {
    constructor(contexto) {
        // posiciones
        this.posx = new Number(Math.trunc(Math.random() * 880) + 60);
        this.posy = new Number(-50);
        //frame referencia al disparo
        this.frame = 1;
        //sentido de la nave
        this.sentido = false;
        //si puede disparar
        this.disparar = false;
        //vidas del enemigo
        this.vidas = 3;
        //incremento
        this.incremento = 5;
        //imagen
        this.figura = new Image();
        this.figura.src = DIR_IMG + "Enemigo/viper.png";

        //dibujo
        this.dibujar = function () {
            let figura = this.getFigura();
            if (this.vidas == 2) {
                this.figura.src = DIR_IMG + "Enemigo/viper2.png";
            }
            if (this.vidas == 1) {
                this.figura.src = DIR_IMG + "Enemigo/viper3.png";
            }
            this.setY();
            this.moverDerecha();
            this.moverIzquierda();
            let x = this.getX();
            let y = this.getY();

            if (isNaN(x) || isNaN(y)) {
                x = Math.rint(LARGO / 2);
                y = ALTO + 15;
            }

            contexto.drawImage(figura, x, y, 60, 60);
        };
        //funciones

        this.reducirVida = function () {
            this.vidas--;
        };
        this.getVida = function () {
            return this.vidas;
        };
        this.getX = function () {
            return this.posx;
        };

        this.getY = function () {
            return this.posy;
        };
        this.getFigura = function () {
            return this.figura;
        };
        this.setY = function () {
            this.posy < 50 && this.posy++;
        };
        this.incrementarIncremento = function (valor) {
            this.incremento += valor;
        };
        this.moverIzquierda = function () {
            if (!this.sentido) {
                this.posx > 0
                    ? (this.posx -= this.incremento)
                    : (this.sentido = true);
            }
        };

        this.moverDerecha = function () {
            if (this.sentido) {
                this.posx < LARGO - 60
                    ? (this.posx += this.incremento)
                    : (this.sentido = false);
            }
        };
    }
}

export class ArmaEnemigo {
    constructor(contexto, nave) {
        //indica el frame de la imagen Disponemos de 8 frames de 1 a 8
        this.frame = 1;
        //imagen
        this.disparo = new Image();
        this.disparo.src =
            DIR_IMG + `/DisparoEnemigo/disparoSimple${this.frame}.png`;
        //las posiciones del disparo son las de la nave pero un pelin más bajo
        this.posX = nave.getX();
        this.posY = nave.getY() + 20;

        this.dibujar = function () {
            this.frame >= 8 ? (this.frame = 1) : this.frame++;
            this.disparo.src =
                DIR_IMG + `/DisparoEnemigo/disparoSimple${this.frame}.png`;
            contexto.drawImage(this.disparo, this.posX, this.posY, 60, 20);
        };

        this.animacion = function () {
            this.posY += 6;
        };
        this.getX = function () {
            return this.posX;
        };
        this.getY = function () {
            return this.posY;
        };

        this.tipo = function () {
            return this.tipo;
        };
    }
}

//permite tener 4 vidas
export class CorazonDorado extends Corazon {
    constructor(posX, contexto) {
        //llamamos a la clase padre corazon
        super();
        //acutalizamos los siguientes valores
        //posicion aleatoria
        this.posx = posX;
        this.posy = 50;
        this.figura.src = DIR_IMG + "CorazonOro/corazon1.png";
        //dibujo
        this.dibujar = function () {
            let x = this.getX();
            let y = this.getY();
            if (isNaN(x) || isNaN(y)) {
                x = Math.rint(LARGO / 2);
                y = ALTO + 15;
            }
            this.frame > 100 ? (this.frame = 10) : this.frame++;
            this.figura.src =
                DIR_IMG +
                `CorazonOro/Corazon${Math.trunc(this.frame / 10)}.png`;

            contexto.drawImage(this.figura, x, y, 60, 60);
        };
    }
}
