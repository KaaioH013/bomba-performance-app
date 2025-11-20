import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GraficoCurvaPerformance({ dados, mostrarPressao = true, mostrarPotencia = true }) {
  if (!dados || dados.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Não há dados suficientes para gerar o gráfico
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Gráfico Vazão x Pressão */}
      {mostrarPressao && (
      <div className="mb-2">
        <h3 className="text-sm font-semibold mb-2 text-center">Vazão x Pressão</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="pressao"
              label={{ value: 'Pressão (Kgf/cm²)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Vazão (m³/h)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="vazao"
              stroke="#2563eb"
              strokeWidth={2}
              name="Vazão (m³/h)"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Gráfico Vazão x Potência */}
      {mostrarPotencia && (
      <div className="mb-2">
        <h3 className="text-sm font-semibold mb-2 text-center">Vazão x Potência Consumida</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="potencia"
              label={{ value: 'Potência (CV)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Vazão (m³/h)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="vazao"
              stroke="#dc2626"
              strokeWidth={2}
              name="Vazão (m³/h)"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
