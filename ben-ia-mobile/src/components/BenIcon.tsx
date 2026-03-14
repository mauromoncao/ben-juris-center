// src/components/BenIcon.tsx
// Ícone "B" Falcon — marca BEN IA
// Fiel à logomarca: dourado #E4B71E + roxo #7B35C8 sobre navy #0A1628
// Estilo circuit-board com nós e traços eletrônicos

import React from 'react'
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg'
import { View, StyleSheet } from 'react-native'

interface BenIconProps {
  size?: number
  bgColor?: string   // fundo do container (padrão: navy #0A1628)
  radius?: number    // border-radius do container
}

export default function BenIcon({ size = 36, bgColor = '#0A1628', radius }: BenIconProps) {
  const r = radius !== undefined ? radius : size * 0.24
  const s = size
  const p = s * 0.1   // padding interno

  return (
    <View style={[
      styles.wrap,
      {
        width: s, height: s,
        borderRadius: r,
        backgroundColor: bgColor,
      }
    ]}>
      <Svg
        width={s - p * 2}
        height={s - p * 2}
        viewBox="0 0 80 80"
        style={{ margin: p }}
      >
        <Defs>
          {/* Gradiente dourado → roxo (igual ao Falcon) */}
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor="#E4B71E" stopOpacity="1" />
            <Stop offset="50%"  stopColor="#C89A18" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7B35C8" stopOpacity="1" />
          </LinearGradient>
          {/* Gradiente mais brilhante para as linhas externas */}
          <LinearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor="#F5D050" stopOpacity="1" />
            <Stop offset="100%" stopColor="#9B55E8" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* ── Traços de circuito externos ──────────────────────── */}
        {/* Topo esquerdo */}
        <Line x1="14" y1="18" x2="8"  y2="18" stroke="#7B35C8" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="7"  cy="18" r="2"  fill="#7B35C8" />
        <Line x1="14" y1="18" x2="14" y2="12" stroke="#7B35C8" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="14" cy="11" r="2" fill="#7B35C8" />

        {/* Topo direito */}
        <Line x1="58" y1="22" x2="68" y2="14" stroke="#E4B71E" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="69" cy="13" r="2.2" fill="#E4B71E" />
        <Line x1="62" y1="18" x2="72" y2="18" stroke="#E4B71E" strokeWidth="1.2" strokeLinecap="round" />
        <Circle cx="73" cy="18" r="1.8" fill="#E4B71E" />

        {/* Centro direito */}
        <Line x1="60" y1="40" x2="72" y2="40" stroke="#E4B71E" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="73" cy="40" r="2.2" fill="#E4B71E" />

        {/* Base esquerda */}
        <Line x1="14" y1="62" x2="6"  y2="62" stroke="#7B35C8" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="5"  cy="62" r="2"  fill="#7B35C8" />
        <Line x1="14" y1="62" x2="14" y2="70" stroke="#7B35C8" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="14" cy="71" r="2" fill="#7B35C8" />

        {/* Base direita */}
        <Line x1="58" y1="58" x2="68" y2="68" stroke="#E4B71E" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="69" cy="69" r="2.2" fill="#E4B71E" />

        {/* Nó central decorativo */}
        <Circle cx="40" cy="40" r="3" fill="none" stroke="#C89A18" strokeWidth="1.2" />
        <Circle cx="40" cy="40" r="1.5" fill="#E4B71E" />

        {/* ── Letra B — corpo principal ─────────────────────────── */}
        {/* Barra vertical esquerda */}
        <Path
          d="M18 14 L18 66"
          stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
        />

        {/* Barra horizontal superior */}
        <Path
          d="M18 14 L44 14"
          stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
        />

        {/* Barra horizontal meio */}
        <Path
          d="M18 40 L42 40"
          stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
        />

        {/* Barra horizontal inferior */}
        <Path
          d="M18 66 L44 66"
          stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
        />

        {/* Curva superior (bump superior do B) */}
        <Path
          d="M44 14 Q62 14 62 27 Q62 40 44 40"
          stroke="url(#grad)" strokeWidth="5"
          fill="none" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Curva inferior (bump inferior do B — maior) */}
        <Path
          d="M44 40 Q64 40 64 53 Q64 66 44 66"
          stroke="url(#glow)" strokeWidth="5"
          fill="none" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Nós nas junções da letra B */}
        <Circle cx="18" cy="14" r="3.5" fill="#E4B71E" />
        <Circle cx="18" cy="40" r="3"   fill="#C89A18" />
        <Circle cx="18" cy="66" r="3.5" fill="#E4B71E" />
        <Circle cx="44" cy="14" r="3"   fill="#E4B71E" />
        <Circle cx="44" cy="40" r="3.5" fill="#C89A18" />
        <Circle cx="44" cy="66" r="3"   fill="#9B55E8" />
        <Circle cx="62" cy="27" r="2.5" fill="#C89A18" />
        <Circle cx="64" cy="53" r="2.5" fill="#9B55E8" />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
})
