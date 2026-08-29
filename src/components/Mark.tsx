/**
 * A marca: a Proposição I.1 dos *Elementos*.
 *
 * É a primeira construção do Livro I, e ela é o projeto inteiro numa figura.
 * Dois círculos de mesmo raio, cada um centrado na circunferência do outro, e o
 * triângulo equilátero que cai da interseção. Nada ali é assumido: o raio é o
 * mesmo por construção, e é só disso que a igualdade dos três lados sai.
 *
 * O que a marca afirma está na diferença entre os dois traços, e ela não é
 * decorativa:
 *
 * - **os círculos são tracejados** porque são a construção, o andaime que
 *   ninguém guarda no fim, e é exatamente o que esta trilha obriga o aluno a
 *   deixar visível em vez de apagar;
 * - **o triângulo é cheio** porque é o que ficou provado.
 *
 * Os dois pontos são os centros, e eles existem porque um centro declarado é o
 * que separa esta figura de dois círculos quaisquer que se cruzam.
 *
 * A geometria é DERIVADA, não digitada: `R` e o vão entre centros mandam, e a
 * altura da interseção sai de Pitágoras. Mexer no raio move a ponta do
 * triângulo sozinha, e nenhuma coordenada precisa ser recalculada à mão.
 * Mesma regra do ADR-0017, um andar acima.
 */
const CX = 50
const CY = 50
const R = 26
const HALF = 14

const LEFT = CX - HALF
const RIGHT = CX + HALF
const APEX = CY - Math.sqrt(R * R - HALF * HALF)

export function Mark({ size = 40, className }: { size?: number; className?: string }) {
  const small = size <= 32
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Euclides"
    >
      {/* a construção, que some no fim */}
      <g strokeWidth={small ? 3.4 : 2.2} strokeDasharray={small ? '6 5' : '4 3.6'} opacity={0.62}>
        <circle cx={LEFT} cy={CY} r={R} />
        <circle cx={RIGHT} cy={CY} r={R} />
      </g>

      {/* o que ficou provado */}
      <path
        d={`M${LEFT} ${CY} L${RIGHT} ${CY} L${CX} ${APEX} Z`}
        strokeWidth={small ? 5 : 3.4}
      />

      {/* os dois centros */}
      <circle cx={LEFT} cy={CY} r={small ? 3 : 2.1} fill="currentColor" stroke="none" />
      <circle cx={RIGHT} cy={CY} r={small ? 3 : 2.1} fill="currentColor" stroke="none" />
    </svg>
  )
}
