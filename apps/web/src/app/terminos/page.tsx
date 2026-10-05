import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Actus",
  description: "Términos de uso del servicio Actus.",
};

export default function TerminosPage() {
  return (
    <LegalDoc title="Términos y Condiciones" updated="4 de octubre de 2026">
      <p>
        Estos términos regulan el uso de Actus (“el servicio”), un asistente de mantenimiento
        industrial por WhatsApp con un panel web para supervisores. Al usar el servicio, aceptás estos
        términos.
      </p>

      <h2>1. El servicio</h2>
      <p>
        Actus permite que los operarios de una planta reporten incidentes por WhatsApp y que un
        asistente con inteligencia artificial sugiera diagnósticos y pasos de resolución, apoyándose en
        la base de conocimiento y la documentación que cada empresa cargue. Los supervisores gestionan
        los incidentes y ven indicadores desde el panel.
      </p>

      <h2>2. El asistente es una ayuda, no un reemplazo del criterio humano</h2>
      <p>
        Las respuestas del asistente son sugerencias generadas automáticamente y pueden contener
        errores. No constituyen asesoramiento profesional ni garantizan la resolución de un incidente.
        <strong>
          {" "}Ante situaciones de riesgo para las personas, la seguridad o con posibilidad de daño a los
          equipos, seguí siempre los protocolos de seguridad de tu planta y el criterio del personal
          responsable.
        </strong>{" "}
        La decisión final sobre cualquier intervención es siempre de la persona a cargo.
      </p>

      <h2>3. Cuentas y responsabilidades</h2>
      <ul>
        <li>El administrador da de alta a los supervisores y cada supervisor da de alta a sus operarios.</li>
        <li>Quien registra a un operario declara contar con su consentimiento para usar su número de WhatsApp con este fin.</li>
        <li>Sos responsable de la actividad realizada desde tu cuenta y de mantener la confidencialidad de tus credenciales.</li>
      </ul>

      <h2>4. Uso aceptable</h2>
      <p>
        Te comprometés a usar el servicio de forma lícita y únicamente para la gestión de mantenimiento
        e incidentes. No podés usarlo para fines ilegales, para vulnerar derechos de terceros, ni
        intentar dañar, sobrecargar o acceder sin autorización a la plataforma.
      </p>

      <h2>5. Contenido y propiedad intelectual</h2>
      <p>
        El contenido que cargás (manuales, documentos, incidentes) sigue siendo tuyo o de tu empresa;
        nos otorgás una licencia limitada para procesarlo con el fin de prestar el servicio. El
        software, la marca y el diseño de Actus son de su titular y no se transfieren.
      </p>

      <h2>6. Disponibilidad y limitación de responsabilidad</h2>
      <p>
        El servicio se ofrece “tal cual” y puede tener interrupciones o cambios. En la máxima medida
        permitida por la ley, Actus no será responsable por daños indirectos o emergentes derivados del
        uso o la imposibilidad de uso del servicio, ni por decisiones tomadas en base a las sugerencias
        del asistente.
      </p>

      <h2>7. Datos personales</h2>
      <p>
        El tratamiento de datos personales se rige por nuestra{" "}
        <a href="/privacidad">Política de Privacidad</a>.
      </p>

      <h2>8. Modificaciones y baja</h2>
      <p>
        Podemos modificar estos términos o el servicio; publicaremos la versión vigente en esta página.
        Podés dejar de usar el servicio en cualquier momento y solicitar la baja de tu cuenta.
      </p>

      <h2>9. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina y cualquier controversia se
        someterá a los tribunales competentes que correspondan.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Ante cualquier consulta, escribinos a <a href="mailto:soporte@actusagent.io">soporte@actusagent.io</a>.
      </p>
    </LegalDoc>
  );
}
