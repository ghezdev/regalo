import type { DialogueEntry } from "../types/content";

export const naomiIntroDialogue: DialogueEntry = {
  id: "naomi-intro-once",
  lines: [
    "Te hice este juego, con un conjunto de edificios el cual podes interactuar.",
    "La idea es que vayas yendo de edificio en edificio, y si queres, disfrutar de lo que contiene cada uno de los edificios.",
    "Tengo muchas cosas mas que te hice para mostrar, pero queria terminar para el sabado 13 de junio a las 23:59, pero no lo logre.",
    "Si quisieras verlas, podes decirmelo, desde ahora no te voy a tener bloqueada.",
    "Asi que te muestro lo poco que pude hacerte. Espero te guste.",
    "Quiero volver a hablarte, pero no se como, despues de lo que hice, creo que no te es comodo volver a hablarte asi de repente.",
    "Por eso hice este juego, para que me des la oportunidad de si hablar o no.",
    "Te extrane, te extrano, y estos dias sin vos me demostraron que nunca voy a dejar de hacerlo.",
    "Saliendo de este castillo, yendo al final de la derecha, encontraras la plaza, donde se ubican el resto de los edificios.",
    "A la izquierda de la plaza, muy a la izquierda, tenes un edificio especial, tiene ambiente tenebroso porque en realidad no es lugar lindo, pero esta si queres ir a verlo.",
    "El final del juego es muy al sur, ahi me vas a encontrar a mi, si decidis seguir bajando luego de verme, significa que no queres hablar conmigo ni saber nada de mi, si fuera asi, yo respetare tu decision.",
    "Si no te vas, y te quedas conmigo, asumo que aceptaste que podamos hablar.",
    "Quiero que tengas la oportunidad de comunicarte conmigo, sin que tengas que hacerlo, porque se cuanto te lastima, y es lo que menos busco.",
    "Espero que te guste, y que elijas lo que elijas, te lleves que nunca te deje de amar, a pesar de haberme ido.",
  ],
};

export const dialogues: Record<string, DialogueEntry> = {
  "fountain-message": {
    id: "fountain-message",
    lines: [
      "La fuente brilla suave en medio de la plaza.",
      "Este lugar todavia esta creciendo, pero ya late como algo hecho para vos.",
    ],
  },
  "dance-room-closed": {
    id: "dance-room-closed",
    lines: [
      "La pista de baile esta cerrada por ahora.",
      "Pronto va a tener una cancion lista para una noche tranquila juntos.",
    ],
  },
  "photo-room-closed": {
    id: "photo-room-closed",
    lines: [
      "La habitacion de fotos esta en preparacion.",
      "Todavia faltan los marcos y las imagenes que van a llenar este lugar.",
    ],
  },
  "audio-calendar-closed": {
    id: "audio-calendar-closed",
    lines: [
      "Aca va a vivir el calendario de audios.",
      "Cada paso va a poder abrir una fecha distinta cuando ese rincón este listo.",
    ],
  },
  "home-closed": {
    id: "home-closed",
    lines: [
      "Nuestra casa todavia no abre sus luces.",
      "Por ahora solo deja ver una promesa calida desde afuera.",
    ],
  },
  "mailbox-placeholder": {
    id: "mailbox-placeholder",
    lines: [
      "El buzon espera su primera nota.",
      "Mas adelante va a servir para mandar mensajes dentro de este regalo.",
    ],
  },
  "castle-entrance": {
    id: "castle-entrance",
    lines: ["La entrada al castillo..."],
  },
  "entrada-izq": {
    id: "entrada-izq",
    lines: ["Entrada izquierda..."],
  },
  "discoteca": {
    id: "discoteca",
    lines: ["La discoteca..."],
  },
  "discoteca-intro": {
    id: "discoteca-intro",
    lines: [
      "Te hice una playlist con canciones de tus artistas que te gustan, espero que te guste y puedas disfrutarlo.",
      "Podríamos venir a escucharlo juntos acá si quisieras.",
    ],
  },
  "casa-intro": {
    id: "casa-intro",
    lines: [
      "Esta es una simulación de lo que sería nuestra casa, no es exactamente como a vos te gustaba, ni como a mi me gustaría, pero es una casa.",
      "Lograr tener una juntos creo que debe ser un gran logro.",
    ],
  },
  "casa-pensamientos-intro": {
    id: "casa-pensamientos-intro",
    lines: [
      "Estás entrando en mis pensamientos, no pensé las cosas que dije acá, solamente sentí y pensé.",
      "Espero no te lastimen.",
      "Cada botón representa cada día que te pensé, va de arriba abajo, izquierda derecha, ese es su orden.",
      "Algunos audios duran casi 20 mins, son muy largos.",
    ],
  },
  "entrada-der": {
    id: "entrada-der",
    lines: ["Entrada derecha..."],
  },
  "zona-sur-der": {
    id: "zona-sur-der",
    lines: ["Zona sur-derecha..."],
  },
  "pre-salida": {
    id: "pre-salida",
    lines: [
      "Acá decidís si le das una oportunidad a Guille para conversar, o si querés irte.",
      "Quedarte no significa volver a dejar todo como antes, solo conversar, conversar lo que no pudieron en su momento.",
      "Irte significa que él no te molestará más, y dará por entendido que no querés saber nada más de él, terminando el juego.",
    ],
  },
  "fondo-sur": {
    id: "fondo-sur",
    lines: [
      "Perdón por todo lo que no te pude dar, espero que puedas conseguir a alguien mejor, disfruta de tu vida al máximo, sos muy hermosa y muy inteligente, sé que te va a ir bien en la vida, carpe diem <3",
    ],
  },
  "casa-pensamientos-exit": {
    id: "casa-pensamientos-exit",
    lines: [
      "A pesar de unos malos pensamientos",
      "Guille te quiere mucho",
      "Todos los días te pensó",
      "Todos los días te extraño",
      "Él no puede estar sin vos",
    ],
  },
  "discoteca-exit": {
    id: "discoteca-exit",
    lines: [
      "Es una playlist que",
      "Si te sabés el nombre de cada una de las canciones que suenan",
      "La primera letra forma 'TEAMOMUCHOMAS'",
      "En respuesta a tu playlist",
      "Está en spotify",
    ],
  },
  "casa-exit": {
    id: "casa-exit",
    lines: [
      "Guille últimamente pensaba mucho en convivir con vos",
      "Tenia ganas de crecer con vos",
      "Hasta consideró tener una familia con vos",
      "Le gustas tanto, que tu pérdida le fue muy dolorosa",
    ],
  },
};

// PLACEHOLDER — Guillermo: personalizar este texto del cartel de la fuente.
export const plazaBanner = {
  title: "Para Naomi",
  subtitle: "Tu plaza de recuerdos",
};
