import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Política de Privacidad — Actus",
  description: "Cómo Actus recopila, usa y protege los datos personales.",
};

export default function PrivacidadPage() {
  return (
    <LegalDoc title="Política de Privacidad" updated="4 de octubre de 2026">
      <p>
        Esta política explica qué datos personales trata Actus (“Actus”, “nosotros”), con qué fines y
        cómo los protegemos. Actus es un asistente de mantenimiento industrial: los operarios de una
        planta reportan incidentes por WhatsApp y los supervisores los gestionan desde un panel web.
        Para consultas sobre privacidad podés escribirnos a <a href="mailto:soporte@actusagent.io">soporte@actusagent.io</a>.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable de los datos es Actus. Si representás a una empresa cliente, esa empresa es
        responsable de los datos de sus operarios y Actus actúa como proveedor que trata esos datos
        por su cuenta y según sus instrucciones.
      </p>

      <h2>2. Qué datos recopilamos</h2>
      <ul>
        <li><strong>Cuentas de supervisores y administradores:</strong> nombre y correo electrónico, gestionados a través de nuestro proveedor de autenticación.</li>
        <li><strong>Operarios:</strong> nombre y número de teléfono de WhatsApp, cargados por su supervisor. Los operarios no crean cuenta ni contraseña.</li>
        <li><strong>Mensajes de WhatsApp:</strong> el contenido que envía el operario para reportar un incidente —texto, notas de voz e imágenes— y la conversación con el asistente.</li>
        <li><strong>Formulario de contacto del sitio:</strong> nombre, correo, empresa, cargo, tamaño de planta, teléfono y mensaje, cuando solicitás una demo.</li>
        <li><strong>Datos técnicos:</strong> registros de uso y de errores necesarios para operar y diagnosticar el servicio.</li>
      </ul>

      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Operar el asistente: entender el incidente reportado y sugerir diagnósticos y pasos de resolución.</li>
        <li>Construir la base de conocimiento de la planta y los indicadores (KPIs) para el supervisor.</li>
        <li>Dar soporte, responder consultas comerciales y mejorar el servicio.</li>
        <li>Cumplir obligaciones legales y resguardar la seguridad del servicio.</li>
      </ul>

      <h2>4. Terceros que procesan datos</h2>
      <p>
        Para prestar el servicio nos apoyamos en proveedores que tratan datos por nuestra cuenta
        (encargados de tratamiento): mensajería de WhatsApp (Meta), modelos de lenguaje para procesar
        texto e imágenes (Anthropic) y para transcribir audio y generar búsquedas (OpenAI),
        autenticación (Clerk), base de datos (Neon), alojamiento (Vercel), envío de correos (Resend) y
        monitoreo de errores (Sentry). Algunos de estos proveedores pueden procesar o almacenar datos
        fuera de Argentina, por ejemplo en los Estados Unidos. No vendemos datos personales.
      </p>

      <h2>5. Conservación</h2>
      <p>
        Conservamos los datos mientras la cuenta esté activa y durante el tiempo necesario para los
        fines descriptos o para cumplir obligaciones legales. Podés solicitar la baja de una cuenta o
        la eliminación de datos escribiéndonos.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina, podés ejercer tus
        derechos de acceso, rectificación, actualización y supresión de tus datos escribiéndonos a{" "}
        <a href="mailto:soporte@actusagent.io">soporte@actusagent.io</a>. La Agencia de Acceso a la Información Pública
        (AAIP) es el organismo de control y atiende las denuncias respecto del incumplimiento de las
        normas de protección de datos.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger los datos, incluyendo el
        cifrado de las comunicaciones en tránsito y el control de acceso. Ningún sistema es
        completamente infalible, pero trabajamos para reducir los riesgos.
      </p>

      <h2>8. Menores</h2>
      <p>El servicio está dirigido a empresas y a su personal; no está destinado a menores de edad.</p>

      <h2>9. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política. Publicaremos la versión vigente en esta página con su fecha de
        última actualización.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Por cualquier consulta sobre esta política o sobre tus datos, escribinos a{" "}
        <a href="mailto:soporte@actusagent.io">soporte@actusagent.io</a>.
      </p>
    </LegalDoc>
  );
}
