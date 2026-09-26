"use client"

import { useEffect, useState, useRef } from "react"

// Acorté la animación de 29 segundos a 12 segundos para que sea más rápida
const TIMING = {
    COMPANY_PULSE: 0,
    COMPANY_TO_FACTORY_BEAM: 700,
    FACTORY_PULSE_START: 0,
    FACTORY_BEAM_ARRIVAL: 1000,
    FACTORY_TO_TECHNICIAN_BEAM: 1500,
    TECHNICIAN_PULSE: 2000,
    TECHNICIAN_TO_SOLUTIONS_BEAM: 2500,
    SOLUTION_A_PULSE: 3000,
    SOLUTION_B_PULSE: 3200,
    SOLUTION_C_PULSE: 3400,
    SOLUTIONS_TO_RESPONSES_BEAM: 4000,
    RESPONSE_A_PULSE: 4500,
    RESPONSE_B_PULSE: 4700,
    RESPONSE_C_PULSE: 4900,
    RESPONSES_TO_CENTER_BEAM: 5500,
    CENTER_SOLUTION_PULSE: 6000, // ← Aquí es cuando se vuelve verde
    CENTER_TO_ORANGE_RESPONSES_BEAM: 6500,
    ORANGE_RESPONSE_A_PULSE: 7000,
    ORANGE_RESPONSE_B_PULSE: 7200,
    ORANGE_RESPONSE_C_PULSE: 7400,
    ORANGE_TO_GREEN_CENTER_BEAM: 8000,
    GREEN_CENTER_PULSE: 8500,
    CENTER_TO_FACTORY_BEAM: 9000,
    FACTORY_RESTART_PULSE: 9500,
    TOTAL_DURATION: 25000,
}

// Animated dot component that moves along a path
function AnimatedDot({
    pathId,
    color,
    isActive,
    duration = 2000
}: {
    pathId: string
    color: string
    isActive: boolean
    duration?: number
}) {
    if (!isActive) return null

    return (
        <g>
            {/* Outer glow */}
            <circle r="10" fill={color} opacity="0.3">
                <animateMotion dur={`${duration}ms`} repeatCount="1" fill="freeze">
                    <mpath xlinkHref={`#${pathId}`} />
                </animateMotion>
            </circle>
            {/* Main dot */}
            <circle r="6" fill={color}>
                <animateMotion dur={`${duration}ms`} repeatCount="1" fill="freeze">
                    <mpath xlinkHref={`#${pathId}`} />
                </animateMotion>
            </circle>
            {/* Bright center */}
            <circle r="3" fill="white">
                <animateMotion dur={`${duration}ms`} repeatCount="1" fill="freeze">
                    <mpath xlinkHref={`#${pathId}`} />
                </animateMotion>
            </circle>
        </g>
    )
}

export default function AnimatedWorkflow() {
    const [animationPhase, setAnimationPhase] = useState(0)
    const [key, setKey] = useState(0)
    const animationRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp
            }

            const elapsed = timestamp - startTimeRef.current

            if (elapsed >= TIMING.TOTAL_DURATION) {
                startTimeRef.current = timestamp
                setKey(k => k + 1)
                setAnimationPhase(0)
            } else {
                setAnimationPhase(elapsed)
            }

            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    const isInRange = (start: number, duration: number) => {
        return animationPhase >= start && animationPhase < start + duration
    }

    // Factory is pulsing while "broken" - from start until machine is fixed
    const factoryPulsing = animationPhase >= TIMING.FACTORY_BEAM_ARRIVAL && animationPhase < TIMING.GREEN_CENTER_PULSE

    return (
        <div className="w-full max-w-[1334px] mx-auto p-4">
            <svg
                key={key}
                width="100%"
                viewBox="0 0 1334 613"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                <defs>
                    {/* Define paths for dot animation */}
                    <path id="path-company-factory" d="M398.5 47H449.5" />
                    <path id="path-factory-technician" d="M585.5 92V142" />
                    <path id="path-tech-solution-a" d="M722.5 178.742C787.905 184.059 747.486 105.478 801.5 110.205" />
                    <path id="path-tech-solution-b" d="M722.5 190H801.5" />
                    <path id="path-tech-solution-c" d="M722.5 200.262C787.905 194.868 747.486 274.587 801.5 269.792" />
                    <path id="path-solution-a-response" d="M1060.5 110H1111.5" />
                    <path id="path-solution-b-response" d="M1060.5 190H1111.5" />
                    <path id="path-solution-c-response" d="M1060.5 270.5H1111.5" />

                    {/* Path from responses to center solution (single path with curves) */}
                    <path id="path-response-to-center" d="M1314.5 270.5H1333.5Q1348.5 270.5 1348.5 285.5V337Q1348.5 352 1333.5 352H1075.5Q1060.5 352 1060.5 352" />

                    {/* Paths from center solution to orange responses */}
                    <path id="path-center-to-orange-a" d="M801.5 342.742C736.095 348.059 776.514 269.478 722.5 274.205" />
                    <path id="path-center-to-orange-b" d="M801.5 355H722.5" />
                    <path id="path-center-to-orange-c" d="M801.5 365.258C736.095 359.941 776.514 438.522 722.5 433.795" />

                    {/* Paths from orange responses to green center (Waste) - with curves */}
                    <path id="path-orange-a-to-green" d="M449.5 274H319.5Q304.5 274 304.5 289V522" />
                    <path id="path-orange-b-to-green" d="M449.5 357H363.5Q348.5 357 348.5 372V522" />
                    <path id="path-orange-c-to-green" d="M449.5 434H406.5Q391.5 434 391.5 449V522" />

                    {/* Path from green center back to company (loop) - with curves */}
                    <path id="path-green-to-company" d="M43.5 568H0.5Q-14.5 568 -14.5 553V47Q-14.5 32 0.5 32H43.5" />

                    {/* Glow filters */}
                    <filter id="glowGreen">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feFlood floodColor="#37CF83" floodOpacity="0.6" result="color" />
                        <feComposite in="color" in2="coloredBlur" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="glowOrange">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feFlood floodColor="#EA580E" floodOpacity="0.6" result="color" />
                        <feComposite in="color" in2="coloredBlur" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="glowRed">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feFlood floodColor="#E92C1B" floodOpacity="0.6" result="color" />
                        <feComposite in="color" in2="coloredBlur" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="glowBlue">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feFlood floodColor="#34427A" floodOpacity="0.6" result="color" />
                        <feComposite in="color" in2="coloredBlur" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Bottom bar */}
                <rect x="44" y="522.5" width="1289" height="90" rx="10.5" fill="white" stroke="#D9D9D9" />

                {/* ===== COMPANY BLOCK (GREEN) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.COMPANY_PULSE, 1000) ? 'url(#glowGreen)' : 'none',
                        transform: isInRange(TIMING.COMPANY_PULSE, 1000) ? 'scale(1.02)' : 'scale(1)',
                        transformOrigin: '221px 45.5px',
                    }}
                >
                    <rect x="44" y="0.5" width="354" height="90" rx="10.5" fill="white" stroke="#D9D9D9" />
                    <circle cx="86.0739" cy="46.4225" r="33.6177" stroke="#37CF83" />
                    <path d="M86.0739 52.6693H86.0895M92.3208 52.6693H92.3364M79.827 52.6693H79.8426M72.0184 57.3545C72.0184 58.1829 72.3474 58.9774 72.9332 59.5631C73.519 60.1489 74.3134 60.478 75.1418 60.478H97.006C97.8344 60.478 98.6288 60.1489 99.2146 59.5631C99.8004 58.9774 100.129 58.1829 100.129 57.3545V40.9564C100.13 40.8163 100.092 40.6788 100.021 40.5582C99.9495 40.4376 99.847 40.3384 99.7242 40.271C99.6014 40.2036 99.4628 40.1705 99.3227 40.1751C99.1827 40.1798 99.0466 40.222 98.9285 40.2974L91.96 44.7389C91.842 44.8143 91.7058 44.8565 91.5658 44.8611C91.4258 44.8657 91.2871 44.8326 91.1643 44.7652C91.0415 44.6978 90.9391 44.5987 90.8678 44.4781C90.7965 44.3575 90.7589 44.2199 90.7591 44.0799V40.9564C90.7592 40.8163 90.7217 40.6788 90.6504 40.5582C90.5791 40.4376 90.4767 40.3384 90.3539 40.271C90.2311 40.2036 90.0924 40.1705 89.9524 40.1751C89.8124 40.1798 89.6762 40.222 89.5581 40.2974L82.5913 44.7389C82.4731 44.8147 82.3368 44.8572 82.1966 44.8621C82.0563 44.8669 81.9174 44.8339 81.7943 44.7664C81.6712 44.699 81.5686 44.5996 81.4973 44.4788C81.4259 44.358 81.3884 44.2202 81.3887 44.0799V35.4904C81.3887 34.662 81.0596 33.8675 80.4739 33.2818C79.8881 32.696 79.0937 32.3669 78.2653 32.3669H75.1418C74.3134 32.3669 73.519 32.696 72.9332 33.2818C72.3474 33.8675 72.0184 34.662 72.0184 35.4904V57.3545Z" stroke="#37CF83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Text: Problema reportado */}
                    <text x="140" y="40" fill="#242F5B" fontSize="14" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Producción al máximo rendimiento</text>
                    <text x="140" y="58" fill="#64748b" fontSize="12" fontFamily="system-ui, -apple-system, sans-serif">Se reporta un problema</text>
                </g>

                {/* ===== FACTORY BLOCK (RED) - with pulse animation while broken ===== */}
                <g
                    style={{
                        filter: factoryPulsing ? 'url(#glowRed)' : 'none',
                    }}
                >
                    <rect x="450" y="1.5" width="272" height="90" rx="10.5" fill="white" stroke="#D9D9D9" />
                    {/* Circle and icon with pulse animation */}
                    <g style={{
                        animation: factoryPulsing ? 'factoryPulse 1.5s ease-in-out infinite' : 'none',
                        transformOrigin: '492.5px 46.5px',
                    }}>
                        <circle cx="492.5" cy="46.5" r="33.5" stroke="#E92C1B" strokeWidth={factoryPulsing ? 2 : 1} />
                        <path d="M502.167 40.1667V50.9583M483.667 57.125V60.2083M502.167 57.125V60.2083M480.583 34H505.25C506.953 34 508.333 35.3805 508.333 37.0833V54.0417C508.333 55.7445 506.953 57.125 505.25 57.125H480.583C478.88 57.125 477.5 55.7445 477.5 54.0417V37.0833C477.5 35.3805 478.88 34 480.583 34ZM485.208 40.1667H494.458C495.31 40.1667 496 40.8569 496 41.7083V49.4167C496 50.2681 495.31 50.9583 494.458 50.9583H485.208C484.357 50.9583 483.667 50.2681 483.667 49.4167V41.7083C483.667 40.8569 484.357 40.1667 485.208 40.1667Z" stroke="#E92C1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    {/* Text: Maquina industrial */}
                    <text x="535" y="40" fill="#242F5B" fontSize="14" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Maquina industrial</text>
                    <text x="535" y="58" fill="#64748b" fontSize="12" fontFamily="system-ui, -apple-system, sans-serif">Falla en Torno T-1000</text>
                </g>

                {/* CSS Animation for factory pulse */}
                <style>
                    {`
            @keyframes factoryPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.08); opacity: 0.85; }
            }
          `}
                </style>

                {/* ===== TECHNICIAN BLOCK (ORANGE) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.TECHNICIAN_PULSE, 1200) ? 'url(#glowOrange)' : 'none',
                        transform: isInRange(TIMING.TECHNICIAN_PULSE, 1200) ? 'scale(1.02)' : 'scale(1)',
                        transformOrigin: '586px 186px',
                    }}
                >
                    <rect x="450" y="141.5" width="272" height="90" rx="10.5" fill="white" stroke="#D9D9D9" />
                    <circle cx="492.5" cy="186" r="33.5" stroke="#EA580E" />
                    <path d="M494.896 180H490.521M497.083 171L495.625 174H500C500.774 174 501.515 174.316 502.062 174.879C502.609 175.441 502.917 176.204 502.917 177V198C502.917 198.796 502.609 199.559 502.062 200.121C501.515 200.684 500.774 201 500 201H485.417C484.643 201 483.901 200.684 483.354 200.121C482.807 199.559 482.5 198.796 482.5 198V177C482.5 176.204 482.807 175.441 483.354 174.879C483.901 174.316 484.643 174 485.417 174H489.792M499.853 201C499.517 199.305 498.623 197.782 497.321 196.688C496.019 195.594 494.389 194.996 492.708 194.996C491.026 194.996 489.397 195.594 488.094 196.688C486.792 197.782 485.898 199.305 485.562 201M488.333 171L492.708 180M497.083 190.5C497.083 192.985 495.125 195 492.708 195C490.292 195 488.333 192.985 488.333 190.5C488.333 188.015 490.292 186 492.708 186C495.125 186 497.083 188.015 497.083 190.5Z" stroke="#EA580E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Text: Tecnico asignado */}
                    <text x="540" y="180" fill="#242F5B" fontSize="14" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Tecnico asignado</text>
                    <text x="540" y="198" fill="#64748b" fontSize="12" fontFamily="system-ui, -apple-system, sans-serif">busca solución al problema</text>
                </g>

                {/* ===== SOLUTION A (BLUE) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.SOLUTION_A_PULSE, 800) ? 'url(#glowBlue)' : 'none',
                        transform: isInRange(TIMING.SOLUTION_A_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '931px 108px',
                    }}
                >
                    <rect x="802" y="82.5" width="258" height="52" rx="6.5" fill="white" stroke="#D9D9D9" />
                    <path d="M829.5 87.5C840.811 87.5 850 96.8909 850 108.5C850 120.109 840.811 129.5 829.5 129.5C818.189 129.5 809 120.109 809 108.5C809 96.8909 818.189 87.5 829.5 87.5Z" stroke="#34427A" />
                    <path d="M833.312 103.625L827.688 109.25M821.5 117.688V100.812C821.5 100.067 821.796 99.3512 822.324 98.8238C822.851 98.2963 823.567 98 824.312 98H838.375C838.673 98 838.96 98.1185 839.17 98.3295C839.381 98.5405 839.5 98.8266 839.5 99.125V119.375C839.5 119.673 839.381 119.96 839.17 120.17C838.96 120.381 838.673 120.5 838.375 120.5H824.312C823.567 120.5 822.851 120.204 822.324 119.676C821.796 119.149 821.5 118.433 821.5 117.688ZM821.5 117.688C821.5 116.942 821.796 116.226 822.324 115.699C822.851 115.171 823.567 114.875 824.312 114.875H839.5M827.688 103.625L833.312 109.25" stroke="#34427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Text */}
                    <text x="862" y="103" fill="#242F5B" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Busqueda en</text>
                    <text x="862" y="118" fill="#64748b" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">manuales</text>
                </g>

                {/* ===== SOLUTION B (BLUE) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.SOLUTION_B_PULSE, 800) ? 'url(#glowBlue)' : 'none',
                        transform: isInRange(TIMING.SOLUTION_B_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '931px 189px',
                    }}
                >
                    <rect x="802" y="163.5" width="258" height="53" rx="6.5" fill="white" stroke="#D9D9D9" />
                    <circle cx="829.5" cy="189" r="20.5" stroke="#34427A" />
                    <path d="M819.5 188.125H822.875C823.472 188.125 824.044 188.362 824.466 188.784C824.888 189.206 825.125 189.778 825.125 190.375V193.75C825.125 194.347 824.888 194.919 824.466 195.341C824.044 195.763 823.472 196 822.875 196H821.75C821.153 196 820.581 195.763 820.159 195.341C819.737 194.919 819.5 194.347 819.5 193.75V188.125ZM819.5 188.125C819.5 186.795 819.762 185.479 820.271 184.25C820.78 183.022 821.525 181.906 822.466 180.966C823.406 180.025 824.522 179.28 825.75 178.771C826.979 178.262 828.295 178 829.625 178C830.955 178 832.271 178.262 833.5 178.771C834.728 179.28 835.844 180.025 836.784 180.966C837.725 181.906 838.47 183.022 838.979 184.25C839.488 185.479 839.75 186.795 839.75 188.125M839.75 188.125V193.75M839.75 188.125H836.375C835.778 188.125 835.206 188.362 834.784 188.784C834.362 189.206 834.125 189.778 834.125 190.375V193.75C834.125 194.347 834.362 194.919 834.784 195.341C835.206 195.763 835.778 196 836.375 196H837.5C838.097 196 838.669 195.763 839.091 195.341C839.513 194.919 839.75 194.347 839.75 193.75M839.75 193.75V196C839.75 197.193 839.276 198.338 838.432 199.182C837.588 200.026 836.443 200.5 835.25 200.5H829.625" stroke="#34427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Text */}
                    <text x="862" y="184" fill="#242F5B" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Consulta a su supervisor</text>
                    <text x="862" y="199" fill="#64748b" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">Buscando casos similares</text>
                </g>

                {/* ===== SOLUTION C (BLUE) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.SOLUTION_C_PULSE, 800) ? 'url(#glowBlue)' : 'none',
                        transform: isInRange(TIMING.SOLUTION_C_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '931px 270px',
                    }}
                >
                    <rect x="802" y="243.5" width="258" height="52" rx="6.5" fill="white" stroke="#D9D9D9" />
                    <path d="M829.5 249.5C840.811 249.5 850 258.891 850 270.5C850 282.109 840.811 291.5 829.5 291.5C818.189 291.5 809 282.109 809 270.5C809 258.891 818.189 249.5 829.5 249.5Z" stroke="#34427A" />
                    <path d="M836.167 280C836.167 277.878 835.289 275.843 833.726 274.343C832.163 272.843 830.043 272 827.833 272M827.833 272C825.623 272 823.504 272.843 821.941 274.343C820.378 275.843 819.5 277.878 819.5 280M827.833 272C830.71 272 833.042 269.761 833.042 267C833.042 264.239 830.71 262 827.833 262C824.957 262 822.625 264.239 822.625 267C822.625 269.761 824.957 272 827.833 272ZM840.333 279C840.333 275.63 838.25 272.5 836.167 271C836.851 270.507 837.399 269.859 837.761 269.114C838.123 268.369 838.288 267.55 838.242 266.73C838.195 265.909 837.939 265.112 837.495 264.409C837.052 263.706 836.434 263.119 835.698 262.7" stroke="#34427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Text */}
                    <text x="862" y="264" fill="#242F5B" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Consulta a sus compañeros</text>
                    <text x="862" y="279" fill="#64748b" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">Departamento propio u otros</text>
                </g>

                {/* ===== RESPONSE A (RIGHT SIDE) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.RESPONSE_A_PULSE, 800) ? 'url(#glowBlue)' : 'none',
                        transform: isInRange(TIMING.RESPONSE_A_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '1213px 108px',
                    }}
                >
                    <rect x="1112" y="82.5" width="202" height="52" rx="6.5" fill="white" stroke="#D9D9D9" />
                    {/* Text */}
                    <text x="1130" y="103" fill="#242F5B" fontSize="11" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Manuales desactualizados</text>
                    <text x="1130" y="118" fill="#64748b" fontSize="10" fontFamily="system-ui, -apple-system, sans-serif">o inexistentes</text>
                </g>

                {/* ===== RESPONSE B (RIGHT SIDE) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.RESPONSE_B_PULSE, 800) ? 'url(#glowBlue)' : 'none',
                        transform: isInRange(TIMING.RESPONSE_B_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '1213px 189px',
                    }}
                >
                    <rect x="1112" y="162.5" width="202" height="53" rx="6.5" fill="white" stroke="#D9D9D9" />
                    {/* Text */}
                    <text x="1130" y="184" fill="#242F5B" fontSize="11" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Esta en otra planta</text>
                    <text x="1130" y="199" fill="#64748b" fontSize="10" fontFamily="system-ui, -apple-system, sans-serif">No lo puede asistir</text>
                </g>

                {/* ===== RESPONSE C (RIGHT SIDE) ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.RESPONSE_C_PULSE, 800) ? 'url(#glowBlue)' : 'none',
                        transform: isInRange(TIMING.RESPONSE_C_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '1213px 269px',
                    }}
                >
                    <rect x="1112" y="243.5" width="202" height="52" rx="6.5" fill="white" stroke="#D9D9D9" />
                    {/* Text */}
                    <text x="1130" y="264" fill="#242F5B" fontSize="11" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Diversas opiniones</text>
                    <text x="1130" y="279" fill="#64748b" fontSize="10" fontFamily="system-ui, -apple-system, sans-serif">Elige la mejor opción</text>
                </g>

                {/* ===== CENTER SOLUTION ===== */}
                {/* Esta es la corrección principal: ahora el box comienza en azul y solo se vuelve verde cuando llega la animación */}
                {/* ===== CENTER SOLUTION ===== */}
                <g
                    style={{
                        filter: isInRange(TIMING.CENTER_SOLUTION_PULSE, 1500) ? 'url(#glowGreen)' : 'none',
                        transform: isInRange(TIMING.CENTER_SOLUTION_PULSE, 1500) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '931px 352px',
                    }}
                >
                    {/* El borde cambia de color basado en si la animación ya pasó */}
                    <rect
                        x="802"
                        y="324.5"
                        width="258"
                        height="53"
                        rx="6.5"
                        fill="white"
                        stroke={animationPhase >= TIMING.CENTER_SOLUTION_PULSE ? "#37CF83" : "#D9D9D9"} // ← CORRECCIÓN: Gris hasta que llegue, luego verde
                        strokeWidth={animationPhase >= TIMING.CENTER_SOLUTION_PULSE ? "2" : "1"} // ← Grosor 2 cuando es verde
                    />
                    <path d="M829.5 331.5C840.811 331.5 850 340.891 850 352.5C850 364.109 840.811 373.5 829.5 373.5C818.189 373.5 809 364.109 809 352.5C809 340.891 818.189 331.5 829.5 331.5Z"
                        stroke={animationPhase >= TIMING.CENTER_SOLUTION_PULSE ? "#37CF83" : "#34427A"} // ← El icono interior sí es azul
                    />
                    <path d="M835.5 361.875C835.5 359.665 834.657 357.545 833.157 355.982C831.657 354.42 829.622 353.542 827.5 353.542M827.5 353.542C825.378 353.542 823.343 354.42 821.843 355.982C820.343 357.545 819.5 359.665 819.5 361.875M827.5 353.542C830.261 353.542 832.5 351.21 832.5 348.333C832.5 345.457 830.261 343.125 827.5 343.125C824.739 343.125 822.5 345.457 822.5 348.333C822.5 351.21 824.739 353.542 827.5 353.542ZM839.5 360.833C839.5 357.323 837.5 354.062 835.5 352.5C836.157 351.986 836.683 351.312 837.031 350.536C837.378 349.76 837.537 348.907 837.492 348.052C837.448 347.197 837.201 346.367 836.775 345.635C836.35 344.902 835.757 344.291 835.05 343.854"
                        stroke={animationPhase >= TIMING.CENTER_SOLUTION_PULSE ? "#37CF83" : "#34427A"} // ← El icono interior sí es azul
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Text */}
                    <text x="862" y="345" fill="#242F5B" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Implementa la solución</text>
                    <text x="862" y="362" fill={animationPhase >= TIMING.CENTER_SOLUTION_PULSE ? "#37CF83" : "#64748b"} fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">problema resuelto</text>
                </g>

                {/* ===== TECHNICIAN RESPONSE BLOCKS (ORANGE) ===== */}
                {/* Time response */}
                <g
                    style={{
                        filter: isInRange(TIMING.ORANGE_RESPONSE_A_PULSE, 800) ? 'url(#glowOrange)' : 'none',
                        transform: isInRange(TIMING.ORANGE_RESPONSE_A_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '586px 274px',
                    }}
                >
                    <rect x="450" y="247.5" width="272" height="53" rx="6.5" fill="white" stroke="#D9D9D9" />
                    <circle cx="688.5" cy="274" r="20.5" stroke="#EA580E" />
                    <path d="M688.75 267.5V274.25L693.25 276.5M700 274.25C700 280.463 694.963 285.5 688.75 285.5C682.537 285.5 677.5 280.463 677.5 274.25C677.5 268.037 682.537 263 688.75 263C694.963 263 700 268.037 700 274.25Z" stroke="#EA580E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="480" y="268" fill="#242F5B" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Tiempo perdido</text>
                    <text x="480" y="283" fill="#64748b" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">Hasta encontrar la solución correcta</text>
                </g>

                {/* Search response */}
                <g
                    style={{
                        filter: isInRange(TIMING.ORANGE_RESPONSE_B_PULSE, 800) ? 'url(#glowOrange)' : 'none',
                        transform: isInRange(TIMING.ORANGE_RESPONSE_B_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '586px 354px',
                    }}
                >
                    <rect x="450" y="328.5" width="272" height="52" rx="6.5" fill="white" stroke="#D9D9D9" />
                    <circle cx="688.5" cy="354.5" r="20.5" stroke="#EA580E" />
                    <path d="M680.795 346.295L696.704 362.205M700 354.25C700 360.463 694.963 365.5 688.75 365.5C682.537 365.5 677.5 360.463 677.5 354.25C677.5 348.037 682.537 343 688.75 343C694.963 343 700 348.037 700 354.25Z" stroke="#EA580E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="480" y="348" fill="#242F5B" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Producción detenida</text>
                    <text x="480" y="363" fill="#64748b" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">Hasta encontrar la solución correcta</text>
                </g>

                {/* Delete/Server response */}
                <g
                    style={{
                        filter: isInRange(TIMING.ORANGE_RESPONSE_C_PULSE, 800) ? 'url(#glowOrange)' : 'none',
                        transform: isInRange(TIMING.ORANGE_RESPONSE_C_PULSE, 800) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '586px 434px',
                    }}
                >
                    <rect x="450" y="407.5" width="272" height="53" rx="6.5" fill="white" stroke="#D9D9D9" />
                    <circle cx="688.5" cy="434" r="20.5" stroke="#EA580E" />
                    <path d="M679.75 429.625V442C679.75 442.597 679.987 443.169 680.409 443.591C680.831 444.013 681.403 444.25 682 444.25H695.5C696.097 444.25 696.669 444.013 697.091 443.591C697.513 443.169 697.75 442.597 697.75 442V429.625M685.938 439.75L691.562 434.125M685.938 434.125L691.562 439.75M678.625 424H698.875C699.496 424 700 424.504 700 425.125V428.5C700 429.121 699.496 429.625 698.875 429.625H678.625C678.004 429.625 677.5 429.121 677.5 428.5V425.125C677.5 424.504 678.004 424 678.625 424Z" stroke="#EA580E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="480" y="428" fill="#242F5B" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Recursos malgastados</text>
                    <text x="480" y="443" fill="#64748b" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">Hasta encontrar la solución correcta</text>
                </g>

                {/* ===== GREEN CENTER BOTTOM ===== */}
                {/* Esta también debería empezar normal y volverse verde cuando llega la animación */}
                <g
                    style={{
                        filter: isInRange(TIMING.GREEN_CENTER_PULSE, 2000) ? 'url(#glowGreen)' : 'none',
                        transform: isInRange(TIMING.GREEN_CENTER_PULSE, 2000) ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '584.5px 568px',
                    }}
                >
                    <circle
                        cx="584.5"
                        cy="568"
                        r="33.5"
                        stroke={animationPhase >= TIMING.GREEN_CENTER_PULSE ? "#37CF83" : "#34427A"} // Azul hasta que llegue, luego verde
                        strokeWidth="2"
                    />
                    <path
                        d="M591.167 561.333H580.417C579.466 561.333 578.555 561.711 577.883 562.383C577.211 563.055 576.833 563.966 576.833 564.917C576.833 565.867 577.211 566.778 577.883 567.45C578.555 568.122 579.466 568.5 580.417 568.5H587.583C588.534 568.5 589.445 568.878 590.117 569.55C590.789 570.222 591.167 571.133 591.167 572.083C591.167 573.034 590.789 573.945 590.117 574.617C589.445 575.289 588.534 575.667 587.583 575.667H576.833M584 579.25V557.75M601.917 568.5C601.917 578.395 593.895 586.417 584 586.417C574.105 586.417 566.083 578.395 566.083 568.5C566.083 558.605 574.105 550.583 584 550.583C593.895 550.583 601.917 558.605 601.917 568.5Z"
                        stroke={animationPhase >= TIMING.GREEN_CENTER_PULSE ? "#37CF83" : "#34427A"} // Azul hasta que llegue, luego verde
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>

                {/* ===== BOTTOM BAR CONTENT ===== */}
                {/* Left - Book icon */}
                <circle cx="104.5" cy="568" r="33.5" stroke="#34427A" />
                <path d="M92.5 581.792V560.542C92.5 559.602 92.8841 558.702 93.5678 558.037C94.2516 557.373 95.1789 557 96.1458 557H114.375C114.762 557 115.133 557.149 115.406 557.415C115.68 557.681 115.833 558.041 115.833 558.417V583.917C115.833 584.292 115.68 584.653 115.406 584.918C115.133 585.184 114.762 585.333 114.375 585.333H96.1458C95.1789 585.333 94.2516 584.96 93.5678 584.296C92.8841 583.632 92.5 582.731 92.5 581.792ZM92.5 581.792C92.5 580.852 92.8841 579.952 93.5678 579.287C94.2516 578.623 95.1789 578.25 96.1458 578.25H115.833" stroke="#34427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x="150" y="562" fill="#242F5B" fontSize="13" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Conocimiento no registrado</text>
                <text x="150" y="580" fill="#64748b" fontSize="12" fontFamily="system-ui, -apple-system, sans-serif">Queda la experiencia con el técnico y no como
                    capital de la empresa</text>

                {/* Right - Chart icon */}
                <circle cx="980.5" cy="568" r="33.5" stroke="#34427A" />
                <path d="M982.083 575.417V563.75M989.375 575.417V571.042M967.5 555V578.333C967.5 579.107 967.807 579.849 968.354 580.396C968.901 580.943 969.643 581.25 970.417 581.25H993.75M974.792 575.417V557.917" stroke="#34427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x="1025" y="562" fill="#242F5B" fontSize="13" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">El supervisor no tiene control </text>
                <text x="1025" y="580" fill="#64748b" fontSize="12" fontFamily="system-ui, -apple-system, sans-serif">No hay registro de actividades para prevención</text>

                {/* Center text for bottom bar */}
                <text x="630" y="562" fill="#242F5B" fontSize="13" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Pérdida de dinero</text>
                <text x="630" y="580" fill="#64748b" fontSize="12" fontFamily="system-ui, -apple-system, sans-serif">En tiempo, recursos físicos y humanos</text>

                {/* ===== CONNECTION LINES ===== */}
                {/* Company to Factory */}
                <path d="M398.5 47H449.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" />
                {/* Factory to Technician */}
                <path d="M585.5 92V142" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" />
                {/* Technician to Solutions (curved) */}
                <path d="M722.5 178.742C787.905 184.059 747.486 105.478 801.5 110.205" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M722.5 190H801.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M722.5 200.262C787.905 194.868 747.486 274.587 801.5 269.792" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Solutions to Responses */}
                <path d="M1060.5 110H1111.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M1060.5 190H1111.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M1060.5 270.5H1111.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" />
                {/* Right side vertical and horizontal - curved */}
                <path d="M1060.5 352H1333.5Q1348.5 352 1348.5 337V270.5Q1348.5 255.5 1333.5 255.5H1314.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                {/* Bottom connections - curved loop */}
                <path d="M43.5 568H0.5Q-14.5 568 -14.5 553V47Q-14.5 32 0.5 32H43.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                {/* Center solution to technician responses (curved) */}
                <path d="M801.5 342.742C736.095 348.059 776.514 269.478 722.5 274.205" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M722.5 355H801.5" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M801.5 365.258C736.095 359.941 776.514 438.522 722.5 433.795" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Technician responses to bottom - curved */}
                <path d="M449.5 357H363.5Q348.5 357 348.5 372V522" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M449.5 274H319.5Q304.5 274 304.5 289V522" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M449.5 434H406.5Q391.5 434 391.5 449V522" stroke="#242F5B" strokeWidth="1.5" strokeLinecap="round" fill="none" />


                {/* ===== ANIMATED DOTS ===== */}
                {/* Green: Company to Factory */}
                <AnimatedDot
                    pathId="path-company-factory"
                    color="#37CF83"
                    isActive={isInRange(TIMING.COMPANY_TO_FACTORY_BEAM, 800)}
                    duration={2000}
                />
                {/* Red: Factory to Technician */}
                <AnimatedDot
                    pathId="path-factory-technician"
                    color="#E92C1B"
                    isActive={isInRange(TIMING.FACTORY_TO_TECHNICIAN_BEAM, 800)}
                    duration={2000}
                />
                {/* Orange: Technician to Solutions A/B/C */}
                <AnimatedDot
                    pathId="path-tech-solution-a"
                    color="#EA580E"
                    isActive={isInRange(TIMING.TECHNICIAN_TO_SOLUTIONS_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-tech-solution-b"
                    color="#EA580E"
                    isActive={isInRange(TIMING.TECHNICIAN_TO_SOLUTIONS_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-tech-solution-c"
                    color="#EA580E"
                    isActive={isInRange(TIMING.TECHNICIAN_TO_SOLUTIONS_BEAM, 1000)}
                    duration={2000}
                />
                {/* Blue: Solutions to Responses */}
                <AnimatedDot
                    pathId="path-solution-a-response"
                    color="#34427A"
                    isActive={isInRange(TIMING.SOLUTIONS_TO_RESPONSES_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-solution-b-response"
                    color="#34427A"
                    isActive={isInRange(TIMING.SOLUTIONS_TO_RESPONSES_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-solution-c-response"
                    color="#34427A"
                    isActive={isInRange(TIMING.SOLUTIONS_TO_RESPONSES_BEAM, 1000)}
                    duration={2000}
                />
                {/* Blue: Responses to Center Solution (single dot) */}
                <AnimatedDot
                    pathId="path-response-to-center"
                    color="#34427A"
                    isActive={isInRange(TIMING.RESPONSES_TO_CENTER_BEAM, 1000)}
                    duration={2000}
                />
                {/* Orange: Center Solution to Orange Responses */}
                <AnimatedDot
                    pathId="path-center-to-orange-a"
                    color="#EA580E"
                    isActive={isInRange(TIMING.CENTER_TO_ORANGE_RESPONSES_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-center-to-orange-b"
                    color="#EA580E"
                    isActive={isInRange(TIMING.CENTER_TO_ORANGE_RESPONSES_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-center-to-orange-c"
                    color="#EA580E"
                    isActive={isInRange(TIMING.CENTER_TO_ORANGE_RESPONSES_BEAM, 1000)}
                    duration={2000}
                />
                {/* Red: Orange Responses to Green Center (Waste) */}
                <AnimatedDot
                    pathId="path-orange-a-to-green"
                    color="#E92C1B"
                    isActive={isInRange(TIMING.ORANGE_TO_GREEN_CENTER_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-orange-b-to-green"
                    color="#E92C1B"
                    isActive={isInRange(TIMING.ORANGE_TO_GREEN_CENTER_BEAM, 1000)}
                    duration={2000}
                />
                <AnimatedDot
                    pathId="path-orange-c-to-green"
                    color="#E92C1B"
                    isActive={isInRange(TIMING.ORANGE_TO_GREEN_CENTER_BEAM, 1000)}
                    duration={2000}
                />
                {/* Red: Green Center back to Company (loop) */}
                <AnimatedDot
                    pathId="path-green-to-company"
                    color="#E92C1B"
                    isActive={isInRange(TIMING.CENTER_TO_FACTORY_BEAM, 1000)}
                    duration={2000}
                />
            </svg>
        </div>
    )
}