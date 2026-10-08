import dashboard from "@/assets/screens/dashboard_screen.svg";
import operator from "@/assets/screens/operators_screen.svg";
import files from "@/assets/screens/files_screen.svg";
import events from "@/assets/screens/events_screen.svg";

// Pantallas del panel del supervisor. El stack de escritorio (CardParallax) usa solo la imagen;
// el carrusel de celular (DashboardCarousel) muestra también título y descripción.
export const projects = [
    {
        title: "Administración de operadores",
        description: "Sus operarios con su nivel y estado. Los da de alta usted, sin apps que instalar.",
        alt: "Pantalla Operadores registrados del panel de Actus",
        src: operator,
        color: ""
    },
    {
        title: "Administración de eventos",
        description: "Cada incidente reportado por WhatsApp, filtrable por estado, tipo, prioridad y operario.",
        alt: "Pantalla Eventos registrados del panel de Actus",
        src: events,
        color: ""
    },
    {
        title: "Documentos de fábrica",
        description: "Manuales y documentación técnica por máquina y sección, listos para que el bot los consulte.",
        alt: "Pantalla Documentos de fábrica del panel de Actus",
        src: files,
        color: ""
    }, {
        title: "Panel del supervisor",
        description: "Eventos abiertos, en progreso y resueltos, operarios activos y documentos, de un vistazo.",
        alt: "Pantalla de inicio del panel de Actus con el resumen de eventos, operadores y archivos",
        src: dashboard,
        color: ""
    }
]
